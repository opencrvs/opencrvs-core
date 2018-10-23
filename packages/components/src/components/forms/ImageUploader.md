A simple image uploader which will capture or upload an image.

```js
<ImageUploader title="Upload" handleFileChange={() => { alert('Uploaded!') }} />
```

```js
const ArrowForward = require('../icons').ArrowForward
;<ImageUploader title="Upload" icon={() => <ArrowForward />} handleFileChange={() => { alert('Uploaded!') }} />
```
