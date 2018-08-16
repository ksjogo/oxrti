/**
 * Hopefully we are not planning to do anything with css strings though
 * withStyles from mui should be used instead
 */
declare module '*.css' {
  const content: any
  //@ts-ignore
  export default content
}

/**
 * Let's treat all glsl files as strings, the webpack loader in loaders will take care of that
 */
declare module '*.glsl' {
  const content: string
  //@ts-ignore
  export = content
}

declare module 'gl-react' {
  let Shaders: {
    create (config: {
      [key: string]: {
        frag: string,
        vert?: string,
      }
    }): { [key: string]: string }
  }
  let Node: React.StatelessComponent<{
    uniforms?: any,
    uniformOptions?: any,
    width?: number,
    height?: number,
    clear?: boolean,
    shader: any,
    ref?: (ref) => void,
    onDraw?: () => void
  }>

  let Bus: React.StatelessComponent<{
    uniform: string,
    index?: number
  }>

  let LinearCopy: React.StatelessComponent
  let NearestCopy: React.StatelessComponent
  export { Shaders, Node, LinearCopy, NearestCopy, Bus }
}

declare module 'file-saver' {
  let saver: {
    saveAs: (blob: Blob, name: string) => void
  }
  export = saver
}

declare module '@attently/riek' {
  let RIEInput: React.StatelessComponent<{
    value: string,
    change: (value: string) => void,
    propName: string
  }>
  export { RIEInput }
}

declare module 'react-dropzone' {
  let dropzone: React.StatelessComponent<{
    onDrop: (files: File[]) => void,
    className?: string
  }>
  export = dropzone
}

declare module 'promise-file-reader' {
  let readAsArrayBuffer: (file: File) => Promise<ArrayBuffer>
  export { readAsArrayBuffer }
}