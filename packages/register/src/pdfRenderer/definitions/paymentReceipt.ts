export const receiptDefinition = {
  info: {
    title: '{title}'
  },
  defaultStyle: {
    font: 'notosans'
  },
  content: [
    {
      text: '{header}',
      style: 'header'
    },
    {
      text: '{registrantName}',
      style: 'header'
    },
    '\n\n',
    {
      text: [
        {
          text: '{serviceTitle}'
        },
        {
          text: '{serviceDescription}',
          style: 'subheader'
        }
      ]
    },
    {
      text: '{amountLabel}'
    },
    {
      text: '{amount}\n\n',
      style: 'amount'
    },
    {
      columns: [
        {
          text: '{issuedAtLable}',
          font: 'notosans',
          width: 65
        },
        {
          text: '{issuedLocation}',
          font: 'notosanslocation'
        }
      ]
    },
    {
      columns: [
        {
          text: '{issuedByLable}',
          font: 'notosans',
          width: 20
        },
        {
          text: '{issuedBy}',
          font: 'notosanslocation'
        }
      ]
    },
    {
      columns: [
        {
          text: '{issuedDateLable}',
          font: 'notosans',
          width: 90
        },
        {
          text: '{issuedDate}',
          font: 'notosanslocation'
        }
      ]
    }
  ],
  styles: {
    header: {
      fontSize: 18
    },
    amount: {
      font: 'notosanscurrency',
      fontSize: 30,
      bold: true
    },
    subheader: {
      bold: true
    }
  }
}

export const receiptFonts = {
  bn: {
    notosans: {
      normal: 'NotoSansBengali-Light.ttf',
      regular: 'NotoSansBengali-Light.ttf',
      bold: 'NotoSansBengali-Regular.ttf'
    },
    notosanscurrency: {
      normal: 'NotoSansBengali-Light.ttf',
      regular: 'NotoSansBengali-Light.ttf',
      bold: 'NotoSansBengali-Light.ttf'
    },
    notosanslocation: {
      normal: 'NotoSans-Light.ttf',
      regular: 'NotoSans-Light.ttf',
      bold: 'NotoSans-Regular.ttf'
    }
  },
  en: {
    notosanscurrency: {
      normal: 'NotoSansBengali-Light.ttf',
      regular: 'NotoSansBengali-Light.ttf',
      bold: 'NotoSansBengali-Light.ttf'
    },
    notosans: {
      normal: 'NotoSans-Light.ttf',
      regular: 'NotoSans-Light.ttf',
      bold: 'NotoSans-Regular.ttf'
    },
    notosanslocation: {
      normal: 'NotoSans-Light.ttf',
      regular: 'NotoSans-Light.ttf',
      bold: 'NotoSans-Regular.ttf'
    }
  }
}
