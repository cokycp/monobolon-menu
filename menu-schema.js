/* Generado automáticamente: estructura de la carta (usado por la carta y por el panel) */
window.MENU_SCHEMA = {
 "menus": [
  {
   "key": "bolones_tigrillos",
   "label": "Bolones y Tigrillos",
   "sections": [
    {
     "key": "masas_bolones",
     "label": "Masas del Bolón",
     "type": "list",
     "prefix": "bt.bolones.masas.",
     "rowClass": "dish-card",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "desc",
       "label": "Descripción",
       "kind": "bi",
       "single": false
      },
      {
       "key": "footer",
       "label": "Nota corta",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto",
       "kind": "img"
      }
     ],
     "hasImage": true,
     "titleKey": "name",
     "block": "masas-bolones"
    },
    {
     "key": "precios_bolones",
     "label": "Precios Bolón",
     "type": "list",
     "prefix": "bt.bolones.precios.",
     "rowClass": "price-table-row",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "entero",
       "label": "Entero",
       "kind": "str"
      },
      {
       "key": "media",
       "label": "Media (1/2)",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "precios-monobolon"
    },
    {
     "key": "tunea_bolon",
     "label": "Tunea tu Bolón (toppings)",
     "type": "list",
     "prefix": "bt.bolones.tunea.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "tunea-bolon"
    },
    {
     "key": "masas_tigrillo",
     "label": "Masas del Tigrillo",
     "type": "list",
     "prefix": "bt.tigrillo.masas.",
     "rowClass": "dish-card",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "desc",
       "label": "Descripción",
       "kind": "bi",
       "single": false
      },
      {
       "key": "footer",
       "label": "Nota corta",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto",
       "kind": "img"
      }
     ],
     "hasImage": true,
     "titleKey": "name",
     "block": "masas-tigrillo"
    },
    {
     "key": "precios_tigrillo",
     "label": "Precios Tigrillo",
     "type": "list",
     "prefix": "bt.tigrillo.precios.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "precios-tigrillo"
    },
    {
     "key": "tunea_tigrillo",
     "label": "Tunea tu Tigrillo (toppings)",
     "type": "list",
     "prefix": "bt.tigrillo.tunea.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "tunea-tigrillo"
    }
   ],
   "blocks": [
    {
     "id": "masas-bolones",
     "title": {
      "es": "NUESTRAS MASAS",
      "en": "OUR DOUGHS"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "masas_bolones"
     ]
    },
    {
     "id": "precios-monobolon",
     "title": {
      "es": "MONOBOLÓN",
      "en": "MONOBOLÓN"
     },
     "titleSel": "h2.section-title",
     "accent": false,
     "lists": [
      "precios_bolones"
     ]
    },
    {
     "id": "tunea-bolon",
     "title": {
      "es": "TUNEA TU BOLÓN",
      "en": "CUSTOMIZE YOUR BOLÓN"
     },
     "titleSel": ".toppings-title",
     "accent": false,
     "lists": [
      "tunea_bolon"
     ]
    },
    {
     "id": "masas-tigrillo",
     "title": {
      "es": "NUESTRAS MASAS",
      "en": "OUR DOUGHS"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "masas_tigrillo"
     ]
    },
    {
     "id": "precios-tigrillo",
     "title": {
      "es": "TIGRILLO",
      "en": "TIGRILLO"
     },
     "titleSel": "h2.section-title",
     "accent": false,
     "lists": [
      "precios_tigrillo"
     ]
    },
    {
     "id": "tunea-tigrillo",
     "title": {
      "es": "TUNEA TU TIGRILLO",
      "en": "CUSTOMIZE YOUR TIGRILLO"
     },
     "titleSel": ".toppings-title",
     "accent": false,
     "lists": [
      "tunea_tigrillo"
     ]
    }
   ]
  },
  {
   "key": "desayunos",
   "label": "Desayunos",
   "sections": [
    {
     "key": "masas",
     "label": "Masas",
     "type": "list",
     "prefix": "desayunos.masas.",
     "rowClass": "dish-card",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "desc",
       "label": "Descripción",
       "kind": "bi",
       "single": false
      },
      {
       "key": "footer",
       "label": "Nota corta",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto",
       "kind": "img"
      }
     ],
     "hasImage": true,
     "titleKey": "name",
     "block": "masas"
    },
    {
     "key": "desayuno_picaditas_combo",
     "label": "Desayuno Picaditas (combos)",
     "type": "list",
     "prefix": "desayunos.picaditas_combo.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "desayunos-esp"
    },
    {
     "key": "desayunos",
     "label": "Desayunos",
     "type": "list",
     "prefix": "desayunos.tipo.",
     "rowClass": null,
     "fixed": true,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "precios",
       "label": "Precios",
       "kind": "list",
       "suffix": ".precios.",
       "rowClass": "drink-item",
       "fields": [
        {
         "key": "name",
         "label": "Nombre",
         "kind": "bi",
         "single": false
        },
        {
         "key": "price",
         "label": "Precio",
         "kind": "str"
        }
       ]
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "desayunos-esp"
    }
   ],
   "blocks": [
    {
     "id": "masas",
     "title": {
      "es": "ELIGE TU MASA",
      "en": "CHOOSE YOUR DOUGH"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "masas"
     ]
    },
    {
     "id": "desayunos-esp",
     "title": {
      "es": "DESAYUNOS ESPECIALES",
      "en": "BREAKFAST SPECIALS"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "desayuno_picaditas_combo",
      "desayunos"
     ]
    }
   ]
  },
  {
   "key": "fuertes",
   "label": "Platos Fuertes",
   "sections": [
    {
     "key": "especiales",
     "label": "Especialidades de la Casa",
     "type": "list",
     "prefix": "fuertes.especiales.",
     "rowClass": "sb-slide",
     "fixed": false,
     "fields": [
      {
       "key": "badge",
       "label": "Título",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto",
       "kind": "img"
      },
      {
       "key": "upsell",
       "label": "Aviso destacado",
       "kind": "bi",
       "single": false,
       "optional": true
      },
      {
       "key": "lines",
       "label": "Opciones y precios",
       "kind": "list",
       "suffix": ".lines.",
       "rowClass": "sb-line",
       "fields": [
        {
         "key": "name",
         "label": "Nombre",
         "kind": "bi",
         "single": false
        },
        {
         "key": "price",
         "label": "Precio",
         "kind": "str"
        }
       ]
      }
     ],
     "hasImage": true,
     "titleKey": "badge",
     "block": "especiales"
    },
    {
     "key": "extras_especialidades",
     "label": "Extras de Especialidades",
     "type": "list",
     "prefix": "fuertes.extras_esp.",
     "rowClass": "extra-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "extras-especialidades"
    },
    {
     "key": "lunch",
     "label": "Menú Lunch",
     "type": "list",
     "prefix": "fuertes.lunch.",
     "rowClass": "item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "sub",
       "label": "Detalle",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "lunch"
    },
    {
     "key": "lunch_hero",
     "label": "Foto del Menú Lunch",
     "type": "hero",
     "id": "fuertes.lunch.hero_image",
     "block": "lunch"
    },
    {
     "key": "extras_lunch",
     "label": "Extras del Lunch",
     "type": "list",
     "prefix": "fuertes.extras_lunch.",
     "rowClass": "extra-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "extras-lunch"
    }
   ],
   "blocks": [
    {
     "id": "especiales",
     "title": {
      "es": "ESPECIALES DE LA CASA",
      "en": "HOUSE SPECIALS"
     },
     "titleSel": "h2.sb-h1",
     "accent": false,
     "lists": [
      "especiales"
     ]
    },
    {
     "id": "extras-especialidades",
     "title": {
      "es": "",
      "en": ""
     },
     "titleSel": null,
     "accent": false,
     "lists": [
      "extras_especialidades"
     ]
    },
    {
     "id": "lunch",
     "title": {
      "es": "MENÚ LUNCH",
      "en": "LUNCH MENU"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "lunch",
      "lunch_hero"
     ]
    },
    {
     "id": "extras-lunch",
     "title": {
      "es": "",
      "en": ""
     },
     "titleSel": null,
     "accent": false,
     "lists": [
      "extras_lunch"
     ]
    }
   ]
  },
  {
   "key": "picadas",
   "label": "Picadas",
   "sections": [
    {
     "key": "picaditas_platos",
     "label": "Picaditas (con foto)",
     "type": "list",
     "prefix": "picadas.platos.",
     "rowClass": "ff-card",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "desc",
       "label": "Descripción",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto",
       "kind": "img"
      }
     ],
     "hasImage": true,
     "titleKey": "name",
     "block": "picaditas"
    },
    {
     "key": "picaditas_precios",
     "label": "Picaditas (precios)",
     "type": "list",
     "prefix": "picadas.precios.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "picaditas"
    },
    {
     "key": "torta",
     "label": "Torta de Verde",
     "type": "list",
     "prefix": "picadas.torta.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "torta"
    }
   ],
   "blocks": [
    {
     "id": "picaditas",
     "title": {
      "es": "PICADITAS",
      "en": "BITES"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "picaditas_platos",
      "picaditas_precios"
     ]
    },
    {
     "id": "torta",
     "title": {
      "es": "TORTA DE VERDE",
      "en": "GREEN PLANTAIN CAKE"
     },
     "titleSel": ".toppings-title",
     "accent": false,
     "lists": [
      "torta"
     ]
    }
   ]
  },
  {
   "key": "bebidas",
   "label": "Bebidas",
   "sections": [
    {
     "key": "frias",
     "label": "Bebidas frías y jugos",
     "type": "list",
     "prefix": "bebidas.frias.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "bebidas-frias"
    },
    {
     "key": "calientes",
     "label": "Bebidas calientes",
     "type": "list",
     "prefix": "bebidas.calientes.",
     "rowClass": "drink-item",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "bebidas-calientes"
    },
    {
     "key": "cocteles_clasicos",
     "label": "Cócteles clásicos",
     "type": "list",
     "prefix": "bebidas.cocteles.",
     "rowClass": "cocktail-card",
     "fixed": false,
     "fields": [
      {
       "key": "name",
       "label": "Nombre",
       "kind": "bi",
       "single": false
      },
      {
       "key": "price",
       "label": "Precio",
       "kind": "str"
      },
      {
       "key": "desc",
       "label": "Descripción",
       "kind": "bi",
       "single": false
      },
      {
       "key": "ings",
       "label": "Ingredientes (separados por coma)",
       "kind": "bi",
       "single": false
      },
      {
       "key": "image",
       "label": "Foto (opcional)",
       "kind": "img",
       "optional": true
      }
     ],
     "hasImage": false,
     "titleKey": "name",
     "block": "cocteles"
    },
    {
     "key": "frias_hero",
     "label": "Foto de Jugos Naturales",
     "type": "hero",
     "id": "bebidas.frias.hero_image",
     "block": "bebidas-frias"
    }
   ],
   "blocks": [
    {
     "id": "bebidas-frias",
     "title": {
      "es": "BEBIDAS",
      "en": "DRINKS"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "frias",
      "frias_hero"
     ]
    },
    {
     "id": "bebidas-calientes",
     "title": {
      "es": "CALIENTES",
      "en": "HOT"
     },
     "titleSel": ".drink-category",
     "accent": false,
     "lists": [
      "calientes"
     ]
    },
    {
     "id": "cocteles",
     "title": {
      "es": "CÓCTELES",
      "en": "COCKTAILS"
     },
     "titleSel": "h2.section-title",
     "accent": true,
     "lists": [
      "cocteles_clasicos"
     ]
    }
   ]
  }
 ]
};
