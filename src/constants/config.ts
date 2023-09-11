import argv from 'minimist'

// Xu li moi truong dev
const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)
