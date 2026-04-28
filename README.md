# Introduction

This repository now contains a plain static version of the site built with HTML, CSS, and a small amount of JavaScript.

## Local Preview

This site now uses shared CSS and JavaScript files. Use a local HTTP server for consistent browser behavior.

From the repository root run:

1. `./serve-local.sh`
2. `ruby -run -e httpd . -p 8000`

Then open:

1. `http://localhost:8000`

## Project Notes

1. The current site at the repository root is the standalone static version.
2. The previous Jekyll source was preserved in `jekyll-source-backup/`.
3. A duplicate standalone copy is still available in `vanilla/`.

## License

Please refer to LICENSE.md.
