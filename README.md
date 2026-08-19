# ha.mr

Compresses links and optimizes QR codes entirely in the browser, without a back-end database.

## How

1. Common parts of the link (e.g. protocol, `www.` prefix, `index.html`) are manually detected and reduced to individual bits. If present, the port is encoded as a raw numeric value.
2. Second-level and top-level domains are matched against a Huffman-coded dictionary of the most common websites and TLDs.
3. The rest of the link is split into parts, and each segment is either fitted to a predefined character set, or Huffman coded.
4. For links, the output is encoded in the full character set of a URL. (I've been informed that square brackets `[]` are not supposed to be a part of this set, but it's too late to change that now.)
5. For QR codes, the output uses the alphanumeric character set to remove overhead compared to other QR code generators.

## Contributing

- **Keep the scope small.** This is a simple project, and it should stay that way. I welcome bug fixes or standard maintenance, but I do not wish to stack features upon features or refactor everything into the newest web framework. One day, this project might reach a state where nothing has to be changed, and that's fine.
- **Discuss, then code.** Search through past issues, or create a new issue if needed, to assess whether the change is necessary. Only _then_ make a pull request. Even if you put a lot of work into your code, please understand that I'm not obligated to merge it if it doesn't align with the project's scope or goals. If the change hasn't been discussed and isn't trivial, I will simply close the pull request and direct you to this here paragraph.
- **Be transparent about tool use.** Look, I wrote this project by hand as a learning exercise, so obviously I'd prefer if it remained "pure". However, banning AI would just lead to people sneaking it in regardless, or worse, out of spite. Instead, I offer a compromise - if you're upfront about where AI was used, if the generated code fits in stylistically, and if you can explain (in your own words) how your change works, I will allow it. If I suspect that you're trying to pass off AI-generated work as your own, I will block you from the repository.

## Acknowledgements

- https://www.npmjs.com/package/lean-qr
- https://github.com/smythp/reddit_links_dataset
- https://github.com/ada-url/url-dataset
