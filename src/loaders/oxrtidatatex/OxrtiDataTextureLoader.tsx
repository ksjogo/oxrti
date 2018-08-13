import {
    globalRegistry,
    WebGLTextureLoaderAsyncHashCache,
} from 'webgltexture-loader'
type TextureAndSize = {
    texture: WebGLTexture,
    width: number,
    height: number,
}
import { TexForRender } from '../../BTFFile'
import { IAppState } from '../../State/AppState'
import pLimit from 'p-limit'

let limiter = pLimit(1)

let appState: IAppState = null
/**
 *  Allow direct texture loading from an in memory btf file
 */
export default class OxrtiDataTextureLoader extends WebGLTextureLoaderAsyncHashCache<TexForRender> {
    gl: WebGLRenderingContext

    canLoad (input: any) {
        return input.type === 'oxrti'
    }

    inputHash (input: TexForRender) {
        return input.ident
    }

    loadNoCache (config: TexForRender): { promise: Promise<TextureAndSize>, dispose: Function } {
        appState.textureIsLoading()
        let gl = this.gl
        let data = config.data
        // console.log(config)
        let promise = createImageBitmap(data)
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
                        // LUMINACE seems to work fine so far
                        type = gl.LUMINANCE
                        break
                    // TOFIX: allow for 1pr6-bit
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
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
                gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, img)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
                // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, beforeFlip)
                appState.textureLoaded()
                return { texture, width: img.width, height: img.height }
            }).catch((reason) => {
                alert('Texture failed to load' + reason)
                console.error(reason)
                console.error(config)
                appState.textureLoaded()
                return { texture: null, width: config.width, height: config.height }
            })
        return {
            promise, dispose: () => {
                //
            },
        }
    }
}

export function Registrator (state: IAppState) {
    appState = state
    globalRegistry.add(OxrtiDataTextureLoader)
}
