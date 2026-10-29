# markanto.org

The website of [Markanto](https://github.com/markantolang/markanto-js), the markup language:
[markanto.org](https://markanto.org).

The specification and the reference parser `@markantolang/parser` live in
[markantolang/markanto-js](https://github.com/markantolang/markanto-js). The specification page here is a copy of
its `spec/`, and the normative text there wins: a correction to the specification belongs there, one to the
website's own pages here.

## Layout

- `config.lima` — the site's settings and navigation, and the specification, read from
  [markantolang/spec](https://github.com/markantolang/spec) at its tags
- `content/pages/` — one bundle per page, written in Markanto
- `theme/` — templates, stylesheets, scripts, images and fonts
- `scripts/` — the logo preparation

## Building

The site is built with [hadley](https://hadley.sh), a static site generator whose repository is not public yet.
[DEPLOYING.md](DEPLOYING.md) has the commands and the checklist for a release.

## License

ISC ([LICENSE](LICENSE)), except the fonts in `theme/assets/fonts/`, which are under the SIL Open Font License 1.1
([OFL.txt](theme/assets/fonts/OFL.txt)).
