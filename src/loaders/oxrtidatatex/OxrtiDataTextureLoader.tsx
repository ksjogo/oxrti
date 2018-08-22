import { globalRegistry, WebGLTextureLoaderAsyncHashCache } from 'webgltexture-loader'
import { TexForRender } from '../../BTFFile'
import { IAppState } from '../../AppState'
import pLimit from 'p-limit'

type TextureAndSize = {
    texture: WebGLTexture,
    width: number,
    height: number,
}
type RetType = { promise: Promise<TextureAndSize>, dispose: Function }

function isWebGL2 (gl: any) {
    if (!gl) return false
    return (typeof (window as any).WebGL2RenderingContext) !== 'undefined'
        && gl instanceof (window as any).WebGL2RenderingContext
}

// if synchronous loads are needed, promises can be thened from here
let limiter = pLimit(1)

// reference to the appstate to ahve access to the loaded btf
let appState: IAppState = null

/**
 *  Allow direct texture loading from an in memory btf file
 */
export default class OxrtiDataTextureLoader extends WebGLTextureLoaderAsyncHashCache<TexForRender> {
    gl: WebGLRenderingContext

    // the input objects will be labled from their config constructed in the BTF
    canLoad (input: any) {
        return input.type === 'oxrti'
    }

    // the BTF is already providing identifiers
    inputHash (input: TexForRender) {
        return input.ident
    }

    // the texture loader library should have some caching on its own, but weird bugs were arising
    // so simple memoization again
    // cache the promises
    cache: { [key: string]: RetType } = {}
    loadNoCache (config: TexForRender): RetType {
        if (this.cache[config.ident])
            return this.cache[config.ident]

        appState.textureIsLoading()
        let gl = this.gl
        let data = config.data
        // console.log(config)
        let promise = createImageBitmap(data, { imageOrientation: 'flipY' })
            // firefox doesn't like 9 big textures and gcs (?) some of them, so we have to limit concurrency if one fails
            // this should still allow max currency for other environments
            .catch((reason) => {
                console.log('Parallel texture load failed:', reason)
                return limiter(() => createImageBitmap(data))
            }).then(img => {
                let texture = gl.createTexture()
                gl.bindTexture(gl.TEXTURE_2D, texture)
                let type: number
                switch (config.format) {
                    case 'PNG8':
                        // gl R8 not supported in webgl context v1
                        // LUMINACE seems to work fine so far in an 8bit contest
                        type = gl.LUMINANCE
                        break
                    // TOFIX: allow for 16-bit
                    case 'PNG24':
                        type = gl.RGB
                        break
                    case 'PNG32':
                        type = gl.RGBA
                        break
                    default:
                        throw new Error(`Currently unsupported fileformat ${config.format}`)
                        break
                }
                gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, img)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

                /*if (isWebGL2(gl)) {
                    gl.generateMipmap(gl.TEXTURE_2D)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
                }*/

                appState.textureLoaded()
                return { texture, width: img.width, height: img.height }
            }).catch((reason) => {
                alert('Texture failed to load' + reason)
                console.error(reason, config)
                appState.textureLoaded()
                return { texture: null, width: config.width, height: config.height }
            })
        let ret = {
            promise, dispose: () => {
                //
            },
        }
        this.cache[config.ident] = ret
        return ret
    }
}

export function Registrator (state: IAppState) {
    appState = state
    globalRegistry.add(OxrtiDataTextureLoader)
}
