<p align="center">
<img src="https://i.imgur.com/ki0rbrX.png">
</p>

<p align="center">
<img src="https://img.shields.io/npm/v/vue-fiery.svg">
<img src="https://img.shields.io/npm/l/vue-fiery.svg">
<img src="https://travis-ci.org/ClickerMonkey/vue-fiery.svg?branch=master">
</p>

## vue-firey

Vue.js binding for Google Firebase Cloud Firestore.

### Prerequisites

Firebase ^5.0.0

### Try it out: Demo

### Installation

#### Globally (Browser)

vue-fiery will be installed automatically.

```html
<!-- Vue -->   
<script src="https://unpkg.com/vue"></script>
<!-- Firebase -->   
<script src="https://www.gstatic.com/firebasejs/4.8.1/firebase.js"></script>
<!-- Firestore -->   
<script src="https://www.gstatic.com/firebasejs/4.6.2/firebase-firestore.js"></script>
<!-- vue-fiery -->   
<script src="https://unpkg.com/vue-fiery"></script>

<script>        
  // Firebase config.
  var config = {
    apiKey: "your-apik-ey",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaing-sender-id"
  }

  // Initialize Firebase.
  firebase.initializeApp(config);
</script>
```

#### npm

Installation via npm : `npm install vue-fiery --save`

### Usage

vue-fiery supports collections (as an array or map), docs, queries, real-time or
fetch once, subcollections, can be stored in data or as a computed property,
return instances of a class, adding active record methods (set, update, remove),
control over what properties are sent on save, deleting sub collections, easy
access for the ID of a document, and callbacks (error, success, missing, remove).

1. using `firestore` option.

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
      todos: this.$fiery(db.collection('todos')) // live collection
    }
  }
})
```

Each record of the array will contain a `.uid` property....

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
