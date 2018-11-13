A generic document viewer with selecting document option.
If columns are not provided then the default with is 100%:

```js
const options = [
  {
    value: 'https://picsum.photos/1920/1080?random',
    label: 'National ID'
  },
  {
    value: 'https://picsum.photos/768/1024?random',
    label: 'Passport'
  }
]
;<DocumentViewer
  title="Supporting Documents"
  tagline="Select to Preview"
  options={options}
  icon={<SupportingDocument />}
/>
```
