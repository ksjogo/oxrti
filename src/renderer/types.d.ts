declare module '*.css' {
  const content: any
  //@ts-ignore
  export default content
}

declare module '*.glsl' {
  const content: string
  //@ts-ignore
  export = content
}