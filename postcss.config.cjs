module.exports = {
    plugins: [
        require('postcss-preset-env')({
            features: {
                'is-pseudo-class': {
                    onComplexSelector: 'ignore',
                },
            },
        }),
        require('autoprefixer'),
    ],
};
