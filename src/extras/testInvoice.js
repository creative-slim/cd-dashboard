import { generateInvoice } from '$utils/invoiceGenerator';
export default function testInvoice() {
  document.querySelector('#invoice-test-btn')?.addEventListener('click', async () => {
    const paymentDetails = {
      finalData: {
        combinedArrays: [
          {
            id: '1',
            data: [
              {
                render: {
                  'item-name': 'nico',
                  'item-width': '54',
                  'item-height': '54',
                  'item-length': '12',
                  'item-details': '12',
                  photos_output_string: 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png',
                  'uploader-file-input-0.jpv5pcjg2pf': 'C:\\fakepath\\2.png',
                  'provided-3D-model': 'false',
                  threed_output_string: '',
                  'uploader-file-input-0.vh7k38pz7c': '',
                },
              },
              {
                render: {
                  'render-type': 'scene',
                  woodtype: 'beech',
                  'render-count': '5',
                  upholstery: 'false',
                  'other-material': '',
                  square: 'false',
                  portrait: 'false',
                  Landscape: 'false',
                  'request-comment': '',
                },
              },
              {
                render: {
                  'render-type': 'knockout',
                  woodtype: 'beech',
                  'render-count': '10',
                  upholstery: 'false',
                  'other-material': '',
                  square: 'false',
                  portrait: 'false',
                  Landscape: 'false',
                  'request-comment': '',
                },
              },
            ],
            files: {
              images: [
                {
                  id: '1',
                  array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png'],
                },
              ],
              files: [],
            },
          },
          {
            id: '2',
            data: [
              {
                render: {
                  'item-name': 'slim',
                  'item-width': '12',
                  'item-height': '55',
                  'item-length': '67',
                  'item-details': '',
                  photos_output_string: 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png',
                  'uploader-file-input-0.falersl2x6o': 'C:\\fakepath\\1.png',
                  'provided-3D-model': 'false',
                  threed_output_string:
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
                  'uploader-file-input-0.iyu9c1ra2k': 'C:\\fakepath\\xx.zip',
                },
              },
              {
                render: {
                  'render-type': 'scene',
                  woodtype: 'wallnut',
                  'render-count': '6',
                  upholstery: 'false',
                  'other-material': '',
                  square: 'false',
                  portrait: 'false',
                  Landscape: 'false',
                  'request-comment': '',
                },
              },
              {
                render: {
                  'render-type': 'knockout',
                  woodtype: 'beech',
                  'render-count': '4',
                  upholstery: 'true',
                  'other-material': 'lether',
                  square: 'true',
                  portrait: 'true',
                  Landscape: 'false',
                  'request-comment': '',
                },
              },
            ],
            files: {
              images: [
                {
                  id: '2',
                  array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png'],
                },
              ],
              files: [
                {
                  id: '2',
                  array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip'],
                },
              ],
            },
          },
          {
            user: '4ce7669f050042d09499b786f19d4beb',
          },
          {
            dateID: '14-5-2024--6:33:16',
          },
          {
            paymentDetails: {
              order: {
                result: 'success',
                data: {
                  id: '14P847251X0838603',
                  status: 'CREATED',
                  links: [
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603',
                      rel: 'self',
                      method: 'GET',
                    },
                    {
                      href: 'https://www.sandbox.paypal.com/checkoutnow?token=14P847251X0838603',
                      rel: 'approve',
                      method: 'GET',
                    },
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603',
                      rel: 'update',
                      method: 'PATCH',
                    },
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/14P847251X0838603/capture',
                      rel: 'capture',
                      method: 'POST',
                    },
                  ],
                },
                order_data_json: {
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'EUR',
                        value: '4425',
                        breakdown: {
                          item_total: {
                            currency_code: 'EUR',
                            value: '4425',
                          },
                        },
                      },
                      items: [
                        {
                          name: 'processing Fee',
                          quantity: '1',
                          description: 'service',
                          category: 'DIGITAL_GOODS',
                          unit_amount: {
                            currency_code: 'EUR',
                            value: 300,
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: 300,
                              },
                            },
                          },
                        },
                        {
                          name: 'nico',
                          quantity: '1',
                          description: 'nico',
                          category: 'DIGITAL_GOODS',
                          allRenderPricing: [
                            {
                              render: 400,
                              prespectives: 425,
                              woodtype: 300,
                            },
                            {
                              render: 150,
                              prespectives: 850,
                              woodtype: 0,
                            },
                          ],
                          unit_amount: {
                            currency_code: 'EUR',
                            value: '2125',
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: '2125',
                              },
                            },
                          },
                        },
                        {
                          name: 'slim',
                          quantity: '1',
                          description: 'slim',
                          category: 'DIGITAL_GOODS',
                          allRenderPricing: [
                            {
                              render: 400,
                              prespectives: 510,
                              woodtype: 300,
                            },
                            {
                              render: 150,
                              prespectives: 340,
                              woodtype: 300,
                            },
                          ],
                          unit_amount: {
                            currency_code: 'EUR',
                            value: '2000',
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: '2000',
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                total: 4425,
                orderItems: [
                  {
                    name: 'processing Fee',
                    quantity: '1',
                    description: 'service',
                    category: 'DIGITAL_GOODS',
                    unit_amount: {
                      currency_code: 'EUR',
                      value: 300,
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: 300,
                        },
                      },
                    },
                  },
                  {
                    name: 'nico',
                    quantity: '1',
                    description: 'nico',
                    category: 'DIGITAL_GOODS',
                    allRenderPricing: [
                      {
                        render: 400,
                        prespectives: 425,
                        woodtype: 300,
                      },
                      {
                        render: 150,
                        prespectives: 850,
                        woodtype: 0,
                      },
                    ],
                    unit_amount: {
                      currency_code: 'EUR',
                      value: '2125',
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: '2125',
                        },
                      },
                    },
                  },
                  {
                    name: 'slim',
                    quantity: '1',
                    description: 'slim',
                    category: 'DIGITAL_GOODS',
                    allRenderPricing: [
                      {
                        render: 400,
                        prespectives: 510,
                        woodtype: 300,
                      },
                      {
                        render: 150,
                        prespectives: 340,
                        woodtype: 300,
                      },
                    ],
                    unit_amount: {
                      currency_code: 'EUR',
                      value: '2000',
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: '2000',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        finalCMSresponse: {
          result: 'success',
          response: [
            {
              id: '666bc823b0fca6955614f1ac',
              cmsLocaleId: null,
              lastPublished: '2024-06-14T04:33:39.094Z',
              lastUpdated: '2024-06-14T04:33:39.094Z',
              createdOn: '2024-06-14T04:33:39.094Z',
              isArchived: false,
              isDraft: false,
              fieldData: {
                specialfunctionscene: false,
                'furniture-dimension-h': 54,
                'furniture-dimension-l': 12,
                'furniture-dimension-w': 54,
                'order-state': '3a8b108b469a23d52b620cb75b914d77',
                payment: 'PayPal Services',
                'furniture-name': 'nico',
                name: 'nico',
                'color-finish': 'beech / beech',
                comment: '12',
                'order-id': 'REND-20240614-0004',
                'order-date': 'Fri Jun 14 2024 06:33:37 GMT+0200 (Central European Summer Time)',
                'additional-images-data':
                  '[{"render":{"item-name":"nico","item-width":"54","item-height":"54","item-length":"12","item-details":"12","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png","uploader-file-input-0.jpv5pcjg2pf":"C:\\\\fakepath\\\\2.png","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.vh7k38pz7c":""}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"5","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"10","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
                slug: 'nico-8cd9d',
                'test-image': {
                  fileId: '666b532975a6b137f75f43ea',
                  url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
                  alt: null,
                },
                'uploaded-images': [
                  {
                    fileId: '666b532975a6b137f75f43ea',
                    url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
                    alt: null,
                  },
                ],
                'user-id': '6620e095b1681d9809914b31',
              },
            },
            {
              id: '666bc8231ab1b49a4ff1bf7c',
              cmsLocaleId: null,
              lastPublished: '2024-06-14T04:33:39.158Z',
              lastUpdated: '2024-06-14T04:33:39.158Z',
              createdOn: '2024-06-14T04:33:39.158Z',
              isArchived: false,
              isDraft: false,
              fieldData: {
                'file-link': 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
                specialfunctionscene: false,
                comment: null,
                'furniture-dimension-h': 55,
                'furniture-dimension-l': 67,
                'furniture-dimension-w': 12,
                'order-state': '3a8b108b469a23d52b620cb75b914d77',
                payment: 'PayPal Services',
                'furniture-name': 'slim',
                name: 'slim',
                'color-finish': 'wallnut / beech',
                'order-id': 'REND-20240614-0004',
                'order-date': 'Fri Jun 14 2024 06:33:37 GMT+0200 (Central European Summer Time)',
                'additional-images-data':
                  '[{"render":{"item-name":"slim","item-width":"12","item-height":"55","item-length":"67","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png","uploader-file-input-0.falersl2x6o":"C:\\\\fakepath\\\\1.png","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip","uploader-file-input-0.iyu9c1ra2k":"C:\\\\fakepath\\\\xx.zip"}},{"render":{"render-type":"scene","woodtype":"wallnut","render-count":"6","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"4","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"false","request-comment":""}}]',
                slug: 'slim-d3a3d',
                'test-image': {
                  fileId: '666b4df96f08ff6ffc53b436',
                  url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
                  alt: null,
                },
                'uploaded-images': [
                  {
                    fileId: '666b4df96f08ff6ffc53b436',
                    url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
                    alt: null,
                  },
                ],
                'user-id': '6620e095b1681d9809914b31',
              },
            },
          ],
        },
      },
    };

    const paymentDetails2 = {
      finalData: {
        combinedArrays: [
          {
            id: '1',
            data: [
              {
                render: {
                  'item-name': 'BIGBED',
                  'item-width': '1200',
                  'item-height': '1700',
                  'item-length': '3000',
                  'item-details': 'I want it big',
                  photos_output_string:
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png',
                  'uploader-file-input-0.fvi5rbs8kzw': 'C:\\fakepath\\1.png',
                  'provided-3D-model': 'false',
                  threed_output_string:
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
                  'uploader-file-input-0.1npr3qe67bb': 'C:\\fakepath\\xx.zip',
                },
              },
              {
                render: {
                  'render-type': 'scene',
                  woodtype: 'beech',
                  'render-count': '3',
                  upholstery: 'true',
                  'other-material': 'lether',
                  square: 'true',
                  portrait: 'true',
                  Landscape: 'true',
                  'request-comment': '',
                },
              },
              {
                render: {
                  'render-type': 'knockout',
                  woodtype: 'beech',
                  'render-count': '5',
                  upholstery: 'true',
                  'other-material': 'lether',
                  square: 'true',
                  portrait: 'true',
                  Landscape: 'true',
                  'request-comment': '',
                },
              },
            ],
            files: {
              images: [
                {
                  id: '1',
                  array: [
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png',
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png',
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png',
                  ],
                },
              ],
              files: [
                {
                  id: '1',
                  array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip'],
                },
              ],
            },
          },
          {
            id: '2',
            data: [
              {
                render: {
                  'item-name': 'TABLE',
                  'item-width': '1500',
                  'item-height': '1840',
                  'item-length': '2000',
                  'item-details': '',
                  photos_output_string:
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png',
                  'uploader-file-input-0.rjseib9fotp': 'C:\\fakepath\\brb.webp',
                  'provided-3D-model': 'false',
                  threed_output_string:
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
                  'uploader-file-input-0.1jwpw1zirz6':
                    'C:\\fakepath\\SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26 (1).zip',
                },
              },
              {
                render: {
                  'render-type': 'scene',
                  woodtype: 'oak',
                  'render-count': '12',
                  upholstery: 'true',
                  'other-material': 'lether',
                  square: 'true',
                  portrait: 'true',
                  Landscape: 'true',
                  'request-comment': 'smoooll',
                },
              },
              {
                render: {
                  'render-type': 'knockout',
                  woodtype: 'beech',
                  'render-count': '5',
                  upholstery: 'true',
                  'other-material': 'lether',
                  square: 'true',
                  portrait: 'true',
                  Landscape: 'true',
                  'request-comment': '',
                },
              },
            ],
            files: {
              images: [
                {
                  id: '2',
                  array: [
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp',
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png',
                  ],
                },
              ],
              files: [
                {
                  id: '2',
                  array: [
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
                  ],
                },
              ],
            },
          },
          {
            user: '4ce7669f050042d09499b786f19d4beb',
          },
          {
            dateID: '14-5-2024--7:50:32',
          },
          {
            paymentDetails: {
              order: {
                result: 'success',
                data: {
                  id: '04M79818KT996911V',
                  status: 'CREATED',
                  links: [
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V',
                      rel: 'self',
                      method: 'GET',
                    },
                    {
                      href: 'https://www.sandbox.paypal.com/checkoutnow?token=04M79818KT996911V',
                      rel: 'approve',
                      method: 'GET',
                    },
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V',
                      rel: 'update',
                      method: 'PATCH',
                    },
                    {
                      href: 'https://api.sandbox.paypal.com/v2/checkout/orders/04M79818KT996911V/capture',
                      rel: 'capture',
                      method: 'POST',
                    },
                  ],
                },
                order_data_json: {
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        currency_code: 'EUR',
                        value: '4425',
                        breakdown: {
                          item_total: {
                            currency_code: 'EUR',
                            value: '4425',
                          },
                        },
                      },
                      items: [
                        {
                          name: 'processing Fee',
                          quantity: '1',
                          description: 'service',
                          category: 'DIGITAL_GOODS',
                          unit_amount: {
                            currency_code: 'EUR',
                            value: 300,
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: 300,
                              },
                            },
                          },
                        },
                        {
                          name: 'BIGBED',
                          quantity: '1',
                          description: 'BIGBED',
                          category: 'DIGITAL_GOODS',
                          allRenderPricing: [
                            {
                              render: 400,
                              prespectives: 255,
                              woodtype: 300,
                            },
                            {
                              render: 150,
                              prespectives: 425,
                              woodtype: 0,
                            },
                          ],
                          unit_amount: {
                            currency_code: 'EUR',
                            value: '1530',
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: '1530',
                              },
                            },
                          },
                        },
                        {
                          name: 'TABLE',
                          quantity: '1',
                          description: 'TABLE',
                          category: 'DIGITAL_GOODS',
                          allRenderPricing: [
                            {
                              render: 400,
                              prespectives: 1020,
                              woodtype: 300,
                            },
                            {
                              render: 150,
                              prespectives: 425,
                              woodtype: 300,
                            },
                          ],
                          unit_amount: {
                            currency_code: 'EUR',
                            value: '2595',
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: '2595',
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
                total: 4425,
                orderItems: [
                  {
                    name: 'processing Fee',
                    quantity: '1',
                    description: 'service',
                    category: 'DIGITAL_GOODS',
                    unit_amount: {
                      currency_code: 'EUR',
                      value: 300,
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: 300,
                        },
                      },
                    },
                  },
                  {
                    name: 'BIGBED',
                    quantity: '1',
                    description: 'BIGBED',
                    category: 'DIGITAL_GOODS',
                    allRenderPricing: [
                      {
                        render: 400,
                        prespectives: 255,
                        woodtype: 300,
                      },
                      {
                        render: 150,
                        prespectives: 425,
                        woodtype: 0,
                      },
                    ],
                    unit_amount: {
                      currency_code: 'EUR',
                      value: '1530',
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: '1530',
                        },
                      },
                    },
                  },
                  {
                    name: 'TABLE',
                    quantity: '1',
                    description: 'TABLE',
                    category: 'DIGITAL_GOODS',
                    allRenderPricing: [
                      {
                        render: 400,
                        prespectives: 1020,
                        woodtype: 300,
                      },
                      {
                        render: 150,
                        prespectives: 425,
                        woodtype: 300,
                      },
                    ],
                    unit_amount: {
                      currency_code: 'EUR',
                      value: '2595',
                      breakdown: {
                        item_total: {
                          currency_code: 'EUR',
                          value: '2595',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        finalCMSresponse: [
          {
            result: 'success',
            response: [
              {
                id: '666bda421ba7f1ace30d3e51',
                cmsLocaleId: null,
                lastPublished: '2024-06-14T05:50:58.086Z',
                lastUpdated: '2024-06-14T05:50:58.086Z',
                createdOn: '2024-06-14T05:50:58.086Z',
                isArchived: false,
                isDraft: false,
                fieldData: {
                  'file-link': 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip',
                  specialfunctionscene: false,
                  'furniture-dimension-h': 1700,
                  'furniture-dimension-l': 3000,
                  'furniture-dimension-w': 1200,
                  'order-state': '3a8b108b469a23d52b620cb75b914d77',
                  payment: 'PayPal Services',
                  'furniture-name': 'BIGBED',
                  name: 'BIGBED',
                  'color-finish': 'beech / beech',
                  comment: 'I want it big',
                  'order-id': 'REND-20240614-0006',
                  'order-date': 'Fri Jun 14 2024 07:50:55 GMT+0200 (Central European Summer Time)',
                  'additional-images-data':
                    '[{"render":{"item-name":"BIGBED","item-width":"1200","item-height":"1700","item-length":"3000","item-details":"I want it big","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/1.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/2.png,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/3.png","uploader-file-input-0.fvi5rbs8kzw":"C:\\\\fakepath\\\\1.png","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/xx.zip","uploader-file-input-0.1npr3qe67bb":"C:\\\\fakepath\\\\xx.zip"}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"3","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"5","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}}]',
                  'test-image': {
                    fileId: '666b4df96f08ff6ffc53b436',
                    url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
                    alt: null,
                  },
                  slug: 'bigbed',
                  'uploaded-images': [
                    {
                      fileId: '666b4df96f08ff6ffc53b436',
                      url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df96f08ff6ffc53b436_1.png',
                      alt: null,
                    },
                    {
                      fileId: '666b532975a6b137f75f43ea',
                      url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b532975a6b137f75f43ea_2.png',
                      alt: null,
                    },
                    {
                      fileId: '666b4df98ed0ea987ad6b06f',
                      url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666b4df98ed0ea987ad6b06f_3.png',
                      alt: null,
                    },
                  ],
                  'user-id': '6620e095b1681d9809914b31',
                },
              },
              {
                id: '666bda42062d41a9129f4e2c',
                cmsLocaleId: null,
                lastPublished: '2024-06-14T05:50:58.035Z',
                lastUpdated: '2024-06-14T05:50:58.035Z',
                createdOn: '2024-06-14T05:50:58.035Z',
                isArchived: false,
                isDraft: false,
                fieldData: {
                  'file-link':
                    'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip',
                  specialfunctionscene: false,
                  comment: null,
                  'furniture-dimension-h': 1840,
                  'furniture-dimension-l': 2000,
                  'furniture-dimension-w': 1500,
                  'order-state': '3a8b108b469a23d52b620cb75b914d77',
                  payment: 'PayPal Services',
                  'furniture-name': 'TABLE',
                  name: 'TABLE',
                  'color-finish': 'oak / beech',
                  'order-id': 'REND-20240614-0006',
                  'order-date': 'Fri Jun 14 2024 07:50:55 GMT+0200 (Central European Summer Time)',
                  'additional-images-data':
                    '[{"render":{"item-name":"TABLE","item-width":"1500","item-height":"1840","item-length":"2000","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/brb.webp,https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Untitled.png","uploader-file-input-0.rjseib9fotp":"C:\\\\fakepath\\\\brb.webp","provided-3D-model":"false","threed_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26_(1).zip","uploader-file-input-0.1jwpw1zirz6":"C:\\\\fakepath\\\\SerialIO-Win10_Win10_IoT_Win11-30.100.2237.26 (1).zip"}},{"render":{"render-type":"scene","woodtype":"oak","render-count":"12","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":"smoooll"}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"5","upholstery":"true","other-material":"lether","square":"true","portrait":"true","Landscape":"true","request-comment":""}}]',
                  slug: 'table',
                  'test-image': {
                    fileId: '666bda41062d41a9129f4e0e',
                    url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e0e_brb.webp',
                    alt: null,
                  },
                  'uploaded-images': [
                    {
                      fileId: '666bda41062d41a9129f4e0b',
                      url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e0b_brb.webp',
                      alt: null,
                    },
                    {
                      fileId: '666bda41062d41a9129f4e23',
                      url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bda41062d41a9129f4e23_Untitled.png',
                      alt: null,
                    },
                  ],
                  'user-id': '6620e095b1681d9809914b31',
                },
              },
            ],
          },
        ],
      },
    };

    const cmsOutput = [
      {
        id: '666bdf5eeda387e0e3879517',
        cmsLocaleId: null,
        lastPublished: '2024-06-14T06:12:46.483Z',
        lastUpdated: '2024-06-14T06:12:46.483Z',
        createdOn: '2024-06-14T06:12:46.483Z',
        isArchived: false,
        isDraft: false,
        fieldData: {
          specialfunctionscene: false,
          comment: null,
          'furniture-dimension-h': 21,
          'furniture-dimension-l': 654,
          'furniture-dimension-w': 54,
          'order-state': '3a8b108b469a23d52b620cb75b914d77',
          payment: 'PayPal Services',
          'furniture-name': 'nico',
          name: 'nico',
          'color-finish': 'beech',
          'order-id': 'REND-20240614-0010',
          'order-date': 'Fri Jun 14 2024 08:12:42 GMT+0200 (Central European Summer Time)',
          'additional-images-data':
            '[{"render":{"item-name":"nico","item-width":"54","item-height":"21","item-length":"654","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713@1@k.jpg","uploader-file-input-0.k32682jzfqp":"C:\\\\fakepath\\\\mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713@1@k.jpg","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.1bwuvfd8p03":""}},{"render":{"render-type":"scene","woodtype":"beech","render-count":"12","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
          slug: 'nico-cc062',
          'test-image': {
            fileId: '666bdf5ceda387e0e38792f6',
            url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5ceda387e0e38792f6_mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713%401%40k.jpeg',
            alt: null,
          },
          'uploaded-images': [
            {
              fileId: '666bdf5ceda387e0e38792f6',
              url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5ceda387e0e38792f6_mountain-burning-night-sky-scenery-digital-art-hd-wallpaper-uhdpaper.com-713%401%40k.jpeg',
              alt: null,
            },
          ],
          'user-id': '6620e095b1681d9809914b31',
        },
      },
      {
        id: '666bdf5c200bc6a1f54bd7f4',
        cmsLocaleId: null,
        lastPublished: '2024-06-14T06:12:44.564Z',
        lastUpdated: '2024-06-14T06:12:44.564Z',
        createdOn: '2024-06-14T06:12:44.564Z',
        isArchived: false,
        isDraft: false,
        fieldData: {
          specialfunctionscene: false,
          comment: null,
          'furniture-dimension-h': 34,
          'furniture-dimension-l': 56,
          'furniture-dimension-w': 34,
          'order-state': '3a8b108b469a23d52b620cb75b914d77',
          payment: 'PayPal Services',
          'furniture-name': '321321',
          name: '321321',
          'color-finish': 'beech',
          'order-id': 'REND-20240614-0010',
          'order-date': 'Fri Jun 14 2024 08:12:42 GMT+0200 (Central European Summer Time)',
          'additional-images-data':
            '[{"render":{"item-name":"321321","item-width":"34","item-height":"34","item-length":"56","item-details":"","photos_output_string":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683@1@k.jpg","uploader-file-input-0.8ev12rh8lof":"C:\\\\fakepath\\\\night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683@1@k.jpg","provided-3D-model":"false","threed_output_string":"","uploader-file-input-0.xrw069ygho":""}},{"render":{"render-type":"knockout","woodtype":"beech","render-count":"3","upholstery":"false","other-material":"","square":"false","portrait":"false","Landscape":"false","request-comment":""}}]',
          slug: '321321-ec190',
          'test-image': {
            fileId: '666bdf5c200bc6a1f54bd7c2',
            url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5c200bc6a1f54bd7c2_night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683%401%40k.jpeg',
            alt: null,
          },
          'uploaded-images': [
            {
              fileId: '666bdf5c200bc6a1f54bd7c2',
              url: 'https://uploads-ssl.webflow.com/6344812d665184745e70e72c/666bdf5c200bc6a1f54bd7c2_night-moon-lake-tree-mountain-clouds-scenery-digital-art-hd-wallpaper-uhdpaper.com-683%401%40k.jpeg',
              alt: null,
            },
          ],
          'user-id': '6620e095b1681d9809914b31',
        },
      },
    ];

    const paymentDetails3 = {
      combinedArrays: {
        order: [
          {
            id: 'order-card-1727031465646',
            inputs: {
              'item-name': 'model_ggiy2u',
              'item-width': '35',
              'item-height': '56',
              'item-length': '51',
              'item-details': 'This is a test detail for model ri1ay',
              photos: 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png',
              'uploader-file-input-0.g3esi0h4aim': 'C:\\fakepath\\web-maintenance.png',
              'three-d-modelling': 'build',
              threed: '',
              'uploader-file-input-0.jrr4w0xx31h': '',
            },
            orderRenders: [
              {
                id: 'order-render-1727031465647',
                inputs: {
                  'render-type': 'scene',
                },
                orderRenderDetails: [
                  {
                    id: 'order-render-detail-1727031465647',
                    inputs: {
                      woodtype: 'beech',
                      'render-count': '4',
                      'aspect-ratio': 'square',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                  {
                    id: 'order-render-detail-1727031468747',
                    inputs: {
                      woodtype: 'oak',
                      'render-count': '4',
                      'aspect-ratio': 'square',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                ],
              },
              {
                id: 'order-render-1727031469864',
                inputs: {
                  'render-type': 'knockout',
                },
                orderRenderDetails: [
                  {
                    id: 'order-render-detail-1727031469865',
                    inputs: {
                      woodtype: 'beech',
                      'render-count': '3',
                      'aspect-ratio': 'square',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                ],
              },
            ],
          },
        ],
        localstorageFiles: {
          images: [
            {
              id: '1',
              array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png'],
            },
          ],
          files: [],
        },
        user: 'slim.abbadi@gmail.com',
        dateID: '22-8-2024--20:58:24',
        userAddress: {
          id: null,
          auth0_id: 'google-oauth2|108072257804188316677',
          first_name: 'slim',
          last_name: 'abbadi',
          email: 'slim.abbadi@gmail.com',
          phone: null,
          street: 'Mossburger Str',
          housenumber: '12',
          additional_address: null,
          zip: '30452',
          city: 'PAFPAF',
          country: 'GERMNA',
          contactperson: null,
          ust_idnr: null,
          company: null,
          amount_spent: 0,
          number_of_orders: 0,
          preferred_language: 'en',
          order_updates: 0,
          support_alerts: 0,
          promotion_alerts: 0,
          feature_update_alerts: 0,
        },
        paymentDetails: {
          order: {
            result: 'success',
            data: {
              id: '06Y83424PU3439346',
              status: 'CREATED',
              links: [
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/06Y83424PU3439346',
                  rel: 'self',
                  method: 'GET',
                },
                {
                  href: 'https://www.sandbox.paypal.com/checkoutnow?token=06Y83424PU3439346',
                  rel: 'approve',
                  method: 'GET',
                },
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/06Y83424PU3439346',
                  rel: 'update',
                  method: 'PATCH',
                },
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/06Y83424PU3439346/capture',
                  rel: 'capture',
                  method: 'POST',
                },
              ],
            },
            order_data_json: {
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: {
                    currency_code: 'EUR',
                    value: '3555',
                    breakdown: {
                      item_total: {
                        currency_code: 'EUR',
                        value: '3555',
                      },
                    },
                  },
                  items: [
                    {
                      name: 'model_ggiy2u',
                      quantity: '1',
                      description: 'model_ggiy2u',
                      category: 'DIGITAL_GOODS',
                      allRenderPricing: [
                        {
                          initialFee: 850,
                        },
                        {
                          prices: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 500,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                          details: {
                            inputs: {
                              woodtype: 'beech',
                              'render-count': '4',
                              'aspect-ratio': 'square',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'scene',
                            pricing: {
                              woodtype: 300,
                              prespectives: 900,
                              renderPricing: 500,
                              initialFee: 850,
                              rendersCountPrice: 600,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                          details: {
                            inputs: {
                              woodtype: 'oak',
                              'render-count': '4',
                              'aspect-ratio': 'square',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'scene',
                            pricing: {
                              woodtype: 300,
                              prespectives: 900,
                              renderPricing: 0,
                              initialFee: 850,
                              rendersCountPrice: 600,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 0,
                            prespectives: 255,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 255,
                          },
                          details: {
                            inputs: {
                              woodtype: 'beech',
                              'render-count': '3',
                              'aspect-ratio': 'square',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'knockout',
                            pricing: {
                              woodtype: 0,
                              prespectives: 255,
                              renderPricing: 150,
                              initialFee: 850,
                              rendersCountPrice: 255,
                            },
                          },
                        },
                      ],
                      unit_amount: {
                        currency_code: 'EUR',
                        value: '3555',
                        breakdown: {
                          item_total: {
                            currency_code: 'EUR',
                            value: '3555',
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
            total: 3555,
            orderItems: [
              {
                name: 'model_ggiy2u',
                quantity: '1',
                description: 'model_ggiy2u',
                category: 'DIGITAL_GOODS',
                allRenderPricing: [
                  {
                    initialFee: 850,
                  },
                  {
                    prices: {
                      woodtype: 300,
                      prespectives: 900,
                      renderPricing: 500,
                      initialFee: 850,
                      rendersCountPrice: 600,
                    },
                    details: {
                      inputs: {
                        woodtype: 'beech',
                        'render-count': '4',
                        'aspect-ratio': 'square',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'scene',
                      pricing: {
                        woodtype: 300,
                        prespectives: 900,
                        renderPricing: 500,
                        initialFee: 850,
                        rendersCountPrice: 600,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 300,
                      prespectives: 900,
                      renderPricing: 0,
                      initialFee: 850,
                      rendersCountPrice: 600,
                    },
                    details: {
                      inputs: {
                        woodtype: 'oak',
                        'render-count': '4',
                        'aspect-ratio': 'square',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'scene',
                      pricing: {
                        woodtype: 300,
                        prespectives: 900,
                        renderPricing: 0,
                        initialFee: 850,
                        rendersCountPrice: 600,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 0,
                      prespectives: 255,
                      renderPricing: 150,
                      initialFee: 850,
                      rendersCountPrice: 255,
                    },
                    details: {
                      inputs: {
                        woodtype: 'beech',
                        'render-count': '3',
                        'aspect-ratio': 'square',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'knockout',
                      pricing: {
                        woodtype: 0,
                        prespectives: 255,
                        renderPricing: 150,
                        initialFee: 850,
                        rendersCountPrice: 255,
                      },
                    },
                  },
                ],
                unit_amount: {
                  currency_code: 'EUR',
                  value: '3555',
                  breakdown: {
                    item_total: {
                      currency_code: 'EUR',
                      value: '3555',
                    },
                  },
                },
              },
            ],
            orderItemsListWithPricing: [
              {
                data: {
                  id: 'order-card-1727031465646',
                  inputs: {
                    'item-name': 'model_ggiy2u',
                    'item-width': '35',
                    'item-height': '56',
                    'item-length': '51',
                    'item-details': 'This is a test detail for model ri1ay',
                    photos:
                      'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png',
                    'uploader-file-input-0.g3esi0h4aim': 'C:\\fakepath\\web-maintenance.png',
                    'three-d-modelling': 'build',
                    threed: '',
                    'uploader-file-input-0.jrr4w0xx31h': '',
                  },
                  orderRenders: [
                    {
                      id: 'order-render-1727031465647',
                      inputs: {
                        'render-type': 'scene',
                      },
                      orderRenderDetails: [
                        {
                          id: 'order-render-detail-1727031465647',
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                        {
                          id: 'order-render-detail-1727031468747',
                          inputs: {
                            woodtype: 'oak',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                      ],
                    },
                    {
                      id: 'order-render-1727031469864',
                      inputs: {
                        'render-type': 'knockout',
                      },
                      orderRenderDetails: [
                        {
                          id: 'order-render-detail-1727031469865',
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '3',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                      ],
                    },
                  ],
                },
                renderWithPrice: [
                  {
                    renders: [
                      {
                        prices: {
                          woodtype: 300,
                          prespectives: 900,
                          renderPricing: 500,
                          initialFee: 850,
                          rendersCountPrice: 600,
                        },
                        details: {
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'scene',
                          pricing: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 500,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                        },
                      },
                      {
                        prices: {
                          woodtype: 300,
                          prespectives: 900,
                          renderPricing: 0,
                          initialFee: 850,
                          rendersCountPrice: 600,
                        },
                        details: {
                          inputs: {
                            woodtype: 'oak',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'scene',
                          pricing: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                        },
                      },
                    ],
                    renderCategory: 'scene',
                    initialFee: 850,
                  },
                  {
                    renders: [
                      {
                        prices: {
                          woodtype: 0,
                          prespectives: 255,
                          renderPricing: 150,
                          initialFee: 850,
                          rendersCountPrice: 255,
                        },
                        details: {
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '3',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'knockout',
                          pricing: {
                            woodtype: 0,
                            prespectives: 255,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 255,
                          },
                        },
                      },
                    ],
                    renderCategory: 'knockout',
                    initialFee: 850,
                  },
                ],
              },
            ],
          },
        },
      },
      finalCMSresponse: {
        result: 'success',
        response: [
          {
            id: '66f068da5134047301eae4c8',
            cmsLocaleId: '66b48864d6ba7c12593a041d',
            lastPublished: '2024-09-22T18:58:34.492Z',
            lastUpdated: '2024-09-22T18:58:34.492Z',
            createdOn: '2024-09-22T18:58:34.492Z',
            isArchived: false,
            isDraft: false,
            fieldData: {
              'special-function': false,
              'furniture-dimension-h': 56,
              'furniture-dimension-l': 51,
              'furniture-dimension-w': 35,
              slug: '7226a4be-ff71-4415-8902-045427ac6228',
              payment: 'PayPal',
              'order-status': 'bezahlt',
              'furniture-name': 'model_ggiy2u',
              name: 'model_ggiy2u',
              woodtype: 'filler woodtype text',
              'general-render-details': 'This is a test detail for model ri1ay',
              comment: 'This is a test detail for model ri1ay',
              'user-mail': 'slim.abbadi@gmail.com',
              'order-id': 'REND-20240922-0011',
              'order-date': 'Sun Sep 22 2024 20:58:33 GMT+0200 (Central European Summer Time)',
              'render-list':
                '{"id":"order-card-1727031465646","inputs":{"item-name":"model_ggiy2u","item-width":"35","item-height":"56","item-length":"51","item-details":"This is a test detail for model ri1ay","photos":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png","uploader-file-input-0.g3esi0h4aim":"C:\\\\fakepath\\\\web-maintenance.png","three-d-modelling":"build","threed":"","uploader-file-input-0.jrr4w0xx31h":""},"orderRenders":[{"id":"order-render-1727031465647","inputs":{"render-type":"scene"},"orderRenderDetails":[{"id":"order-render-detail-1727031465647","inputs":{"woodtype":"beech","render-count":"4","aspect-ratio":"square","Upholstery":"false","upholstry-material":"","render-details-comment":""}},{"id":"order-render-detail-1727031468747","inputs":{"woodtype":"oak","render-count":"4","aspect-ratio":"square","Upholstery":"false","upholstry-material":"","render-details-comment":""}}]},{"id":"order-render-1727031469864","inputs":{"render-type":"knockout"},"orderRenderDetails":[{"id":"order-render-detail-1727031469865","inputs":{"woodtype":"beech","render-count":"3","aspect-ratio":"square","Upholstery":"false","upholstry-material":"","render-details-comment":""}}]}]}',
              'payment-info': '"filler text"',
              'uploaded-images': [
                {
                  fileId: '66efe95ffcfd1a37d64be6f2',
                  url: 'https://cdn.prod.website-files.com/66b48864d6ba7c12593a0445/66efe95ffcfd1a37d64be6f2_web-maintenance.png',
                  alt: null,
                },
              ],
            },
          },
        ],
      },
    };

    const paymentDetailsNew = {
      combinedArrays: {
        order: [
          {
            id: 'order-card-1727027277295',
            inputs: {
              'item-name': 'TESTBIG',
              'item-width': '74',
              'item-height': '17',
              'item-length': '72',
              'item-details': 'This is a test detail for model paqet',
              photos: 'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png',
              'uploader-file-input-0.od8mioivtom': 'C:\\fakepath\\web-maintenance.png',
              'three-d-modelling': 'build',
              threed: '',
              'uploader-file-input-0.a866az9mu0u': '',
            },
            orderRenders: [
              {
                id: 'order-render-1727027277296',
                inputs: {
                  'render-type': 'knockout',
                },
                orderRenderDetails: [
                  {
                    id: 'order-render-detail-1727027277296',
                    inputs: {
                      woodtype: 'walnut',
                      'render-count': '34',
                      'aspect-ratio': 'landscape',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                  {
                    id: 'order-render-detail-1727027588068',
                    inputs: {
                      woodtype: 'walnut',
                      'render-count': '43',
                      'aspect-ratio': 'square',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                ],
              },
              {
                id: 'order-render-1727027588960',
                inputs: {
                  'render-type': 'scene',
                },
                orderRenderDetails: [
                  {
                    id: 'order-render-detail-1727027588960',
                    inputs: {
                      woodtype: 'beech',
                      'render-count': '4',
                      'aspect-ratio': 'square',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                  {
                    id: 'order-render-detail-1727027590338',
                    inputs: {
                      woodtype: 'oak',
                      'render-count': '4',
                      'aspect-ratio': 'landscape',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                ],
              },
              {
                id: 'order-render-1727027594174',
                inputs: {
                  'render-type': 'knockout',
                },
                orderRenderDetails: [
                  {
                    id: 'order-render-detail-1727027594174',
                    inputs: {
                      woodtype: 'walnut',
                      'render-count': '7',
                      'aspect-ratio': 'portrait',
                      Upholstery: 'false',
                      'upholstry-material': '',
                      'render-details-comment': '',
                    },
                  },
                ],
              },
            ],
          },
        ],
        localstorageFiles: {
          images: [
            {
              id: '1',
              array: ['https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png'],
            },
          ],
          files: [],
        },
        user: 'slim.abbadi@gmail.com',
        dateID: '22-8-2024--19:54:18',
        userAddress: {
          id: null,
          auth0_id: 'google-oauth2|108072257804188316677',
          first_name: 'slim',
          last_name: 'abbadi',
          email: 'slim.abbadi@gmail.com',
          phone: null,
          street: 'Mossburger Str',
          housenumber: '12',
          additional_address: null,
          zip: '30452',
          city: 'PAFPAF',
          country: 'GERMNA',
          contactperson: null,
          ust_idnr: null,
          company: null,
          amount_spent: 0,
          number_of_orders: 0,
          preferred_language: 'en',
          order_updates: 0,
          support_alerts: 0,
          promotion_alerts: 0,
          feature_update_alerts: 0,
        },
        paymentDetails: {
          order: {
            result: 'success',
            data: {
              id: '4C100889N73943436',
              status: 'CREATED',
              links: [
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4C100889N73943436',
                  rel: 'self',
                  method: 'GET',
                },
                {
                  href: 'https://www.sandbox.paypal.com/checkoutnow?token=4C100889N73943436',
                  rel: 'approve',
                  method: 'GET',
                },
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4C100889N73943436',
                  rel: 'update',
                  method: 'PATCH',
                },
                {
                  href: 'https://api.sandbox.paypal.com/v2/checkout/orders/4C100889N73943436/capture',
                  rel: 'capture',
                  method: 'POST',
                },
              ],
            },
            order_data_json: {
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: {
                    currency_code: 'EUR',
                    value: '10890',
                    breakdown: {
                      item_total: {
                        currency_code: 'EUR',
                        value: '10890',
                      },
                    },
                  },
                  items: [
                    {
                      name: 'TESTBIG',
                      quantity: '1',
                      description: 'TESTBIG',
                      category: 'DIGITAL_GOODS',
                      allRenderPricing: [
                        {
                          initialFee: 850,
                        },
                        {
                          prices: {
                            woodtype: 300,
                            prespectives: 3190,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 2890,
                          },
                          details: {
                            inputs: {
                              woodtype: 'walnut',
                              'render-count': '34',
                              'aspect-ratio': 'landscape',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'knockout',
                            pricing: {
                              woodtype: 300,
                              prespectives: 3190,
                              renderPricing: 150,
                              initialFee: 850,
                              rendersCountPrice: 2890,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 0,
                            prespectives: 3655,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 3655,
                          },
                          details: {
                            inputs: {
                              woodtype: 'walnut',
                              'render-count': '43',
                              'aspect-ratio': 'square',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'knockout',
                            pricing: {
                              woodtype: 0,
                              prespectives: 3655,
                              renderPricing: 0,
                              initialFee: 850,
                              rendersCountPrice: 3655,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 500,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                          details: {
                            inputs: {
                              woodtype: 'beech',
                              'render-count': '4',
                              'aspect-ratio': 'square',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'scene',
                            pricing: {
                              woodtype: 300,
                              prespectives: 900,
                              renderPricing: 500,
                              initialFee: 850,
                              rendersCountPrice: 600,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                          details: {
                            inputs: {
                              woodtype: 'oak',
                              'render-count': '4',
                              'aspect-ratio': 'landscape',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'scene',
                            pricing: {
                              woodtype: 300,
                              prespectives: 900,
                              renderPricing: 0,
                              initialFee: 850,
                              rendersCountPrice: 600,
                            },
                          },
                        },
                        {
                          prices: {
                            woodtype: 0,
                            prespectives: 595,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 595,
                          },
                          details: {
                            inputs: {
                              woodtype: 'walnut',
                              'render-count': '7',
                              'aspect-ratio': 'portrait',
                              Upholstery: 'false',
                              'upholstry-material': '',
                              'render-details-comment': '',
                            },
                            renderType: 'knockout',
                            pricing: {
                              woodtype: 0,
                              prespectives: 595,
                              renderPricing: 150,
                              initialFee: 850,
                              rendersCountPrice: 595,
                            },
                          },
                        },
                      ],
                      unit_amount: {
                        currency_code: 'EUR',
                        value: '10890',
                        breakdown: {
                          item_total: {
                            currency_code: 'EUR',
                            value: '10890',
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
            total: 10890,
            orderItems: [
              {
                name: 'TESTBIG',
                quantity: '1',
                description: 'TESTBIG',
                category: 'DIGITAL_GOODS',
                allRenderPricing: [
                  {
                    initialFee: 850,
                  },
                  {
                    prices: {
                      woodtype: 300,
                      prespectives: 3190,
                      renderPricing: 150,
                      initialFee: 850,
                      rendersCountPrice: 2890,
                    },
                    details: {
                      inputs: {
                        woodtype: 'walnut',
                        'render-count': '34',
                        'aspect-ratio': 'landscape',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'knockout',
                      pricing: {
                        woodtype: 300,
                        prespectives: 3190,
                        renderPricing: 150,
                        initialFee: 850,
                        rendersCountPrice: 2890,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 0,
                      prespectives: 3655,
                      renderPricing: 0,
                      initialFee: 850,
                      rendersCountPrice: 3655,
                    },
                    details: {
                      inputs: {
                        woodtype: 'walnut',
                        'render-count': '43',
                        'aspect-ratio': 'square',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'knockout',
                      pricing: {
                        woodtype: 0,
                        prespectives: 3655,
                        renderPricing: 0,
                        initialFee: 850,
                        rendersCountPrice: 3655,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 300,
                      prespectives: 900,
                      renderPricing: 500,
                      initialFee: 850,
                      rendersCountPrice: 600,
                    },
                    details: {
                      inputs: {
                        woodtype: 'beech',
                        'render-count': '4',
                        'aspect-ratio': 'square',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'scene',
                      pricing: {
                        woodtype: 300,
                        prespectives: 900,
                        renderPricing: 500,
                        initialFee: 850,
                        rendersCountPrice: 600,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 300,
                      prespectives: 900,
                      renderPricing: 0,
                      initialFee: 850,
                      rendersCountPrice: 600,
                    },
                    details: {
                      inputs: {
                        woodtype: 'oak',
                        'render-count': '4',
                        'aspect-ratio': 'landscape',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'scene',
                      pricing: {
                        woodtype: 300,
                        prespectives: 900,
                        renderPricing: 0,
                        initialFee: 850,
                        rendersCountPrice: 600,
                      },
                    },
                  },
                  {
                    prices: {
                      woodtype: 0,
                      prespectives: 595,
                      renderPricing: 150,
                      initialFee: 850,
                      rendersCountPrice: 595,
                    },
                    details: {
                      inputs: {
                        woodtype: 'walnut',
                        'render-count': '7',
                        'aspect-ratio': 'portrait',
                        Upholstery: 'false',
                        'upholstry-material': '',
                        'render-details-comment': '',
                      },
                      renderType: 'knockout',
                      pricing: {
                        woodtype: 0,
                        prespectives: 595,
                        renderPricing: 150,
                        initialFee: 850,
                        rendersCountPrice: 595,
                      },
                    },
                  },
                ],
                unit_amount: {
                  currency_code: 'EUR',
                  value: '10890',
                  breakdown: {
                    item_total: {
                      currency_code: 'EUR',
                      value: '10890',
                    },
                  },
                },
              },
            ],
            orderItemsListWithPricing: [
              {
                data: {
                  id: 'order-card-1727027277295',
                  inputs: {
                    'item-name': 'TESTBIG',
                    'item-width': '74',
                    'item-height': '17',
                    'item-length': '72',
                    'item-details': 'This is a test detail for model paqet',
                    photos:
                      'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png',
                    'uploader-file-input-0.od8mioivtom': 'C:\\fakepath\\web-maintenance.png',
                    'three-d-modelling': 'build',
                    threed: '',
                    'uploader-file-input-0.a866az9mu0u': '',
                  },
                  orderRenders: [
                    {
                      id: 'order-render-1727027277296',
                      inputs: {
                        'render-type': 'knockout',
                      },
                      orderRenderDetails: [
                        {
                          id: 'order-render-detail-1727027277296',
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '34',
                            'aspect-ratio': 'landscape',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                        {
                          id: 'order-render-detail-1727027588068',
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '43',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                      ],
                    },
                    {
                      id: 'order-render-1727027588960',
                      inputs: {
                        'render-type': 'scene',
                      },
                      orderRenderDetails: [
                        {
                          id: 'order-render-detail-1727027588960',
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                        {
                          id: 'order-render-detail-1727027590338',
                          inputs: {
                            woodtype: 'oak',
                            'render-count': '4',
                            'aspect-ratio': 'landscape',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                      ],
                    },
                    {
                      id: 'order-render-1727027594174',
                      inputs: {
                        'render-type': 'knockout',
                      },
                      orderRenderDetails: [
                        {
                          id: 'order-render-detail-1727027594174',
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '7',
                            'aspect-ratio': 'portrait',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                        },
                      ],
                    },
                  ],
                },
                renderWithPrice: [
                  {
                    renders: [
                      {
                        prices: {
                          woodtype: 300,
                          prespectives: 3190,
                          renderPricing: 150,
                          initialFee: 850,
                          rendersCountPrice: 2890,
                        },
                        details: {
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '34',
                            'aspect-ratio': 'landscape',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'knockout',
                          pricing: {
                            woodtype: 300,
                            prespectives: 3190,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 2890,
                          },
                        },
                      },
                      {
                        prices: {
                          woodtype: 0,
                          prespectives: 3655,
                          renderPricing: 0,
                          initialFee: 850,
                          rendersCountPrice: 3655,
                        },
                        details: {
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '43',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'knockout',
                          pricing: {
                            woodtype: 0,
                            prespectives: 3655,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 3655,
                          },
                        },
                      },
                    ],
                    renderCategory: 'knockout',
                    initialFee: 850,
                  },
                  {
                    renders: [
                      {
                        prices: {
                          woodtype: 300,
                          prespectives: 900,
                          renderPricing: 500,
                          initialFee: 850,
                          rendersCountPrice: 600,
                        },
                        details: {
                          inputs: {
                            woodtype: 'beech',
                            'render-count': '4',
                            'aspect-ratio': 'square',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'scene',
                          pricing: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 500,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                        },
                      },
                      {
                        prices: {
                          woodtype: 300,
                          prespectives: 900,
                          renderPricing: 0,
                          initialFee: 850,
                          rendersCountPrice: 600,
                        },
                        details: {
                          inputs: {
                            woodtype: 'oak',
                            'render-count': '4',
                            'aspect-ratio': 'landscape',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'scene',
                          pricing: {
                            woodtype: 300,
                            prespectives: 900,
                            renderPricing: 0,
                            initialFee: 850,
                            rendersCountPrice: 600,
                          },
                        },
                      },
                    ],
                    renderCategory: 'scene',
                    initialFee: 850,
                  },
                  {
                    renders: [
                      {
                        prices: {
                          woodtype: 0,
                          prespectives: 595,
                          renderPricing: 150,
                          initialFee: 850,
                          rendersCountPrice: 595,
                        },
                        details: {
                          inputs: {
                            woodtype: 'walnut',
                            'render-count': '7',
                            'aspect-ratio': 'portrait',
                            Upholstery: 'false',
                            'upholstry-material': '',
                            'render-details-comment': '',
                          },
                          renderType: 'knockout',
                          pricing: {
                            woodtype: 0,
                            prespectives: 595,
                            renderPricing: 150,
                            initialFee: 850,
                            rendersCountPrice: 595,
                          },
                        },
                      },
                    ],
                    renderCategory: 'knockout',
                    initialFee: 850,
                  },
                ],
              },
            ],
          },
        },
      },
      finalCMSresponse: {
        result: 'success',
        response: [
          {
            id: '66f059d20ec75ae2655cd0b4',
            cmsLocaleId: '66b48864d6ba7c12593a041d',
            lastPublished: '2024-09-22T17:54:26.559Z',
            lastUpdated: '2024-09-22T17:54:26.559Z',
            createdOn: '2024-09-22T17:54:26.559Z',
            isArchived: false,
            isDraft: false,
            fieldData: {
              'special-function': false,
              'furniture-dimension-h': 17,
              'furniture-dimension-l': 72,
              'furniture-dimension-w': 74,
              slug: '9cb54a67-f98d-4ecd-b9d6-b9a5d54501e9',
              payment: 'PayPal',
              'order-status': 'bezahlt',
              'furniture-name': 'TESTBIG',
              name: 'TESTBIG',
              woodtype: 'filler woodtype text',
              'general-render-details': 'This is a test detail for model paqet',
              comment: 'This is a test detail for model paqet',
              'user-mail': 'slim.abbadi@gmail.com',
              'order-id': 'REND-20240922-0010',
              'order-date': 'Sun Sep 22 2024 19:54:25 GMT+0200 (Central European Summer Time)',
              'render-list':
                '{"id":"order-card-1727027277295","inputs":{"item-name":"TESTBIG","item-width":"74","item-height":"17","item-length":"72","item-details":"This is a test detail for model paqet","photos":"https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/web-maintenance.png","uploader-file-input-0.od8mioivtom":"C:\\\\fakepath\\\\web-maintenance.png","three-d-modelling":"build","threed":"","uploader-file-input-0.a866az9mu0u":""},"orderRenders":[{"id":"order-render-1727027277296","inputs":{"render-type":"knockout"},"orderRenderDetails":[{"id":"order-render-detail-1727027277296","inputs":{"woodtype":"walnut","render-count":"34","aspect-ratio":"landscape","Upholstery":"false","upholstry-material":"","render-details-comment":""}},{"id":"order-render-detail-1727027588068","inputs":{"woodtype":"walnut","render-count":"43","aspect-ratio":"square","Upholstery":"false","upholstry-material":"","render-details-comment":""}}]},{"id":"order-render-1727027588960","inputs":{"render-type":"scene"},"orderRenderDetails":[{"id":"order-render-detail-1727027588960","inputs":{"woodtype":"beech","render-count":"4","aspect-ratio":"square","Upholstery":"false","upholstry-material":"","render-details-comment":""}},{"id":"order-render-detail-1727027590338","inputs":{"woodtype":"oak","render-count":"4","aspect-ratio":"landscape","Upholstery":"false","upholstry-material":"","render-details-comment":""}}]},{"id":"order-render-1727027594174","inputs":{"render-type":"knockout"},"orderRenderDetails":[{"id":"order-render-detail-1727027594174","inputs":{"woodtype":"walnut","render-count":"7","aspect-ratio":"portrait","Upholstery":"false","upholstry-material":"","render-details-comment":""}}]}]}',
              'payment-info': '"filler text"',
              'uploaded-images': [
                {
                  fileId: '66efe95ffcfd1a37d64be6f2',
                  url: 'https://cdn.prod.website-files.com/66b48864d6ba7c12593a0445/66efe95ffcfd1a37d64be6f2_web-maintenance.png',
                  alt: null,
                },
              ],
            },
          },
        ],
      },
    };

    const pdfLink =
      'https://pub-7cf2671b894a43fe9366b6528b0ced3e.r2.dev/Invoice_REND-20240614-0010';

    // Uncomment if needed
    const pdfFile = await generateInvoice(paymentDetails3);
    // const TEST_invoiceToCms = uploadInvoiceToCMS(pdfLink, cmsOutput);

    console.log({ pdfFile });
  });
}
