import ConverterStrategy from './ConverterStrategy'

type ConverterStrategyConfig = {
    fileEndings: string[],
    strategy: new (...args: any[]) => ConverterStrategy,
}
export default ConverterStrategyConfig
