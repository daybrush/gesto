<p align="middle" ><img src="https://github.com/daybrush/gesto/raw/master/demo/images/logo.png" /></p>

<h2 align="middle">Gesto</h2>
<p align="middle"><a href="https://www.npmjs.com/package/gesto" target="_blank"><img src="https://img.shields.io/npm/v/gesto.svg?style=flat-square&color=007acc&label=version" alt="npm version" /></a> <img src="https://img.shields.io/badge/language-typescript-blue.svg?style=flat-square"/> <a href="https://github.com/daybrush/gesto/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/daybrush/gesto.svg?style=flat-square&label=license&color=08CE5D"/></a>
</p>

<p align="middle">You can set up drag, pinch events in any browser.</p>


* [API Documentation](https://daybrush.com/gesto/release/latest/doc/)

## ⚙️ Installation
```sh
$ npm i gesto
```

```html
<script src="https://daybrush.com/gesto/release/latest/dist/gesto.min.js"></script>
```


## 🚀 How to use
```ts
import Gesto from "gesto";

let tx = 0;
let ty = 0;
let scale = 1;

const getso = new Gesto(target, {
    container: window,
    pinchOutside: true,
}).on("drag", e => {
    tx += e.deltaX;
    ty += e.deltaY;
    target.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}).on("pinchStart", e => {
    e.datas.scale = scale;
}).on("pinch", e => {
    scale = e.datas.scale * e.scale;
    target.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
});

// remove event
getso.unset();
```

## 👏 Contributing

If you have any questions or requests or want to contribute to `gesto`, please write the [issue](https://github.com/daybrush/gesto/issues) or give me a Pull Request freely.

## 🐞 Bug Report

If you find a bug, please report to us opening a new [Issue](https://github.com/daybrush/gesto/issues) on GitHub.


## 📝 License

This project is [MIT](https://github.com/daybrush/gesto/blob/master/LICENSE) licensed.

```
MIT License

Copyright (c) 2019 Daybrush

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
