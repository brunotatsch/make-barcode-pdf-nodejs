const express = require('express')
const ejs = require('ejs')
const path = require('path')
const puppeteer = require('puppeteer')
const app = express()

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

app.get('/pdf', async(request, response) => {

  const browser = await puppeteer.launch()
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

app.get('/', (request, response) => {

  const filePath = path.join(__dirname, "print.ejs")
  ejs.renderFile(filePath, { locations }, (err, html) => {
      if(err) {
          return response.send('Erro na leitura do arquivo')
      }
  
      // enviar para o navegador
      return response.send(html)
  })
 
})

app.listen(3000)