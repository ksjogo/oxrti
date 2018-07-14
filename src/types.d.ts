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