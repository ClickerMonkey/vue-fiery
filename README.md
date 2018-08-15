
<p align="center">
<img src="https://img.shields.io/npm/v/vue-fiery.svg">
<img src="https://img.shields.io/npm/l/vue-fiery.svg">
<img src="https://travis-ci.org/ClickerMonkey/vue-fiery.svg?branch=master">
</p>

## vue-fiery

Vue.js binding for Google Firebase Cloud Firestore.

#### Features
- Documents [example](#documents)
- Collections (stored as array or map) [example](#collections)
- Queries (stored as array or map) [example](#queries)
- Real-time or once [example](#real-time-or-once)
- Data or Computed properties
- Overwriting, updating, removing
- Sub-collections (with cascading deletions!)
- Return instances of a class
- Adding active record methods (set, update, remove)
- Control over what properties are sent on save
- Adding the ID of the document to the document
- Callbacks (error, success, missing, remove)
- Custom binding / unbinding

**Contents**
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

### Dependencies

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

### Documents

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() (
    const $fiery = this.$fiery
    return {
      currentUser: $fiery(db.collection('users').doc(this.currentUserId)) // not reactive, but is updated real-time
    }
  }
})
```

### Collections

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() (
    const $fiery = this.$fiery
    return {
      cars: $fiery(db.collection('cars')) // real-time array
      carMap: $fiery(db.collection('cars'), {map: true}) // real-time map: carMap[id] = car
    }
  }
})
```

### Queries

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() (
    const $fiery = this.$fiery
    return {
      currentCars: $fiery(db.collection('cars'), { // real-time array
        query: (cars) => cars.where('created_by', '==', this.currentUserId)
      }) 
      currentCarMap: $fiery(db.collection('cars'), { // real-time map: currentCarMap[id] = car
        query: (cars) => cars.where('created_by', '==', this.currentUserId),
        map: true
      }) 
    }
  }
})
```

### Real-time or once

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() (
    const $fiery = this.$fiery
    return {
      // real-time is default, all you need to do is specify once: true to disable it
      cars: $fiery(db.collection('cars'), {once: true}), // array populated once
      currentUser: $fiery(db.collection('users').doc(this.currentUserId), {once: true}), // current user populated once
    }
  }
})
```


## LICENSE
[MIT](https://opensource.org/licenses/MIT)
