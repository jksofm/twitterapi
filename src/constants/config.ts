// import argv from 'minimist'

// Xu li moi truong dev
// const options = argv(process.argv.slice(2))
const env = process.env.NODE_ENV

export const isProduction = env === 'production'
