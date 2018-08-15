
<p align="center">
<img src="https://img.shields.io/npm/v/vue-fiery.svg">
<img src="https://img.shields.io/npm/l/vue-fiery.svg">
<img src="https://travis-ci.org/ClickerMonkey/vue-fiery.svg?branch=master">
</p>

## vue-fiery

Vue.js binding for Google Firebase Cloud Firestore.

#### Supports
- Collections / Queries (stored as array or map)
- Documents
- Real-time or Fetch Once
- Sub-collections (with cascading deletions!)
- Data or Computed properties
- Return instances of a class
- Adding active record methods (set, update, remove)
- Control over what properties are sent on save
- Adding the ID of the document to the document
- Callbacks (error, success, missing, remove)

### Prerequisites

- Firebase ^5.0.0
- Vue: ^1.0.28

### Installation

#### npm

Installation via npm : `npm install vue-fiery --save`

### Usage

```javascript
import Vue from 'vue'
import VueFiery from 'vue-fiery'
import firebase from 'firebase'

require('firebase/firestore')

Vue.use(VueFiery)

const firebaseApp = firebase.initializeApp({ ... })
const db = firebaseApp.firestore();

var vm = new Vue({
  el: '#app',
  data() {
    return {
      todos: this.$fiery(db.collection('todos')) // live collection,
      ford: this.$fiery(db.collection('cars').doc('ford')) // live document

      // complex collection example
      persons: this.$fiery(db.collection('persons'), {
        once: true,
        key: 'id', // store the document IDs in the object.id field
        type: Person, // use this constructor to make them all instances of Person
        record: true, // add $set, $update, $remove and $ref to Person
        sub: {
          contacts: {
            once: false, // but the contacts can be live! live is the default
            record: true, // we can add these functions to the plain objects
          }
        }
      }),

      // used below
      role: 'admin'
    }
  },
  computed: {
    // Updated when role changes
    personsWithRole() {
      return this.$fiery(db.collection('persons'), {
        query: (q) => q.where('role', '==', this.role),
        type: Person
      })
    }
  }
})
```

Each record of the array will contain a `.uid` property. This helps identify
what firestore database the document is stored, and in what collection.

```json
[
    {
        ".uid": "1///1///todos/-Jtjl482BaXBCI7brMT8",
        "name": "Star vue-fiery",
        "done": true
    }
]
```

### Adding
### Updating
### Removing
### Active Record

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
