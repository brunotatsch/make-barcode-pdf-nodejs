const express = require('express')
const ejs = require('ejs')
const path = require('path')
const puppeteer = require('puppeteer')
const app = express()
const Barcode = require('jsbarcode')
const { createCanvas, addPage } = require('canvas')


const port = 3000

const locations = [
  {
    name: "PTM01-01-01",
    tag: "123456789"
  },
  {
    name: "PTM01-01-02",
    tag: "234567890"
  },
  {
    name: "PTM01-01-03",
    tag: "345678901"
  },
];

app.get('/pdf-ejs', async (request, response) => {

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/ejs', {
    waitUntil: 'networkidle0'
  })

  const pdf = await page.pdf({
    printBackground: false,
    height: '200',
    width: '340'
  })

  await browser.close()

  response.contentType("application/pdf")

  return response.send(pdf)

})

app.get('/pdf-handlebars', async (request, response) => {

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/', {
    waitUntil: 'networkidle0'
  })

  const pdf = await page.pdf({
    printBackground: true,
    format: 'Letter'
  })

  await browser.close()

  response.contentType("application/pdf")

  return response.send(pdf)

})

app.get('/ejs', (request, response) => {

  const filePath = path.join(__dirname, "printTagExemple2.ejs")
  ejs.renderFile(filePath, { locations }, (err, html) => {
    if (err) {
      return response.send('Erro na leitura do arquivo')
    }

    // enviar para o navegador
    return response.send(html)
  })

})

app.get('/barcode', (request, response) => {

  const canvas = createCanvas(340, 150, 'pdf');
  const ctx = canvas.getContext('2d');
  const canvasBarcode = createCanvas(340, 150, 'pdf');

  locations.forEach(location => {

    Barcode(canvasBarcode, location.name, {
      format: "CODE128",
      displayValue: true,
      fontSize: 18,
      textMargin: 10,
    });

    ctx.drawImage(canvasBarcode, 0, 0);
    ctx.addPage();
  });

  canvas.toBuffer();

  response.contentType("application/pdf")

  const stream = canvas.createPDFStream();

  stream.pipe(response);

})


app.listen(3000)