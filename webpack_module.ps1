try {
    copy package.webpack.json package.json -verbose
    npx webpack

} finally {
    copy package.extension.json package.json -verbose
}
pause
