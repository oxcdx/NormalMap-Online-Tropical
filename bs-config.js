module.exports = {
  "server": {
    "baseDir": "src", // Serve files from the src directory
    "routes": {
      "/": "index.html" // Optional: Explicitly route the root to index.html
    }
  },
  "files": [
    "src/index.html", // Updated path for index.html
    "src/style.css", // Assuming style.css is still at the root
    "src/javascripts/**/*.js", // Assuming your JS files are now under src
    "src/stylesheets/**/*.css" // Assuming your CSS files are now under src
  ],
  "watchOptions": {
    "ignoreInitial": true
  }
};