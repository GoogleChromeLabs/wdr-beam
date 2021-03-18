# wdr-beam (Web DevRel Beam)

Are you creating content for [developer.chrome.com](https://developer.chrome.com) or [web.dev](https://web.dev)? Then this package may be for you!

Instead of running to the web based uploader tool for every file you want to add an image, this tool can easily upload all your images after you're done writing your post.

---

## Installation

```bash
npm i -g wdr-beam
```

---

## Usage

Just inlucde your image in the same folder as the post you're working on, and include it in your post as a Markdown image or an HTML Image tag:

```markdown
![This dog's name is Jerry!](./jerry.jpg)

...

<img class="w-screenshot" src="./screenshot.png" alt="This is a screenshot">
```

Then in that folder run the command:

```bash
wdr-beam
```

This library will find all the images in your markdown, upload them to the CDN, delete them locally, and update your posts markdown to use the `Img` shortcode. What you'll get is this:

```markdown
{% Img src="image/kSLjHjkFgscBC2j2d6j9/jU9Od9IDqFlmuYzAtirn.jpg", alt="This dog's name is Jerry!" %}

...

{% Img src="image/kSLjHjkFgscBC2j2d6j9/jU9Od9IDqFlmuYzAtirn.jpg", alt="This is a screenshot", class="w-screenshot" %}
```

---

## Options

The library requires an auth token and a domain, which it will prompt for, or you can provide them as additional arguments when you run the library.

| Option                    | Description                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| -V, --version             | output the version number                                                                                              |
| -D, --domain \<string\>   | domain of site uploading for, developer.chrome.com or web.dev                                                          |
| -F, --filepath \<string\> | directory to search in (defaults to current directory)                                                                 |
| -T, --token \<string\>    | auth token, you can generate one at [https://chrome-gcs-uploader.web.app/cli](https://chrome-gcs-uploader.web.app/cli) |
| -h, --help                | display help for command                                                                                               |
---

## WARNING

This library isn't perfect though... It won't catch all images (like if your image is not in the same folder as the markdown file). Also if it finds an image in a codeblock that is an actual image in the folder, well, it will update it.

Look over the changes this library makes and undo the changes it shouldn't have!
