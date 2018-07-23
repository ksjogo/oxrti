export default interface IConverterUI {
    setMessage (message: string): Promise<void>
    setProgress (progress: number): Promise<void>
}
