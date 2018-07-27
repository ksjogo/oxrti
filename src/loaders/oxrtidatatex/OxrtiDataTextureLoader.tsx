import {
    globalRegistry,
    WebGLTextureLoaderAsyncHashCache,
} from 'webgltexture-loader'
type TextureAndSize = {
    texture: WebGLTexture,
    width: number,
    height: number,
}
import { sha1 } from 'crypto-hash'
import { TexForRender } from '../../BTFFile'

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
        let gl = this.gl
        let promise = createImageBitmap(config.data).then(img => {
            let texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            // gl R8 not supported in webgl context v1
            // LUMINACE seems to work fine so far
            // TOFIX: allow for 16-bit
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            return { texture, width: img.width, height: img.height }
        })
        return {
            promise, dispose: () => {
                //
            },
        }
    }
}

export function Registrator () {
    globalRegistry.add(OxrtiDataTextureLoader)
}
