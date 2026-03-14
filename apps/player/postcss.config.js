export default {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {
      stage: 3,
      overrideBrowserslist: ['chrome >= 38'],
      features: {
        'nesting-rules': false,
        'custom-properties': { preserve: false },
      },
    },
    autoprefixer: {},
  },
}
