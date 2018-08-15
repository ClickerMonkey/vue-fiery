
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
- Data or computed properties [example](#data-or-computed)
- Adding, updating, overwriting, removing [example](#adding-updating-overwriting-removing)
- Sub-collections (with cascading deletions!) [example](#sub-collections)
- Return instances of a class [example](#return-instance-of-class)
- Add active record methods (set, update, remove) [example](#active-record)
- Control over what properties are sent on save [example](#save-fields)
- Adding the key to the document [example](#adding-key-to-object)
- Callbacks (error, success, missing, remove) [example](#callbacks)
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
  data() {
    const $fiery = this.$fiery
    return {
      settings: $fiery(db.collection('settings').doc('system')),
      currentUser: $fiery(db.collection('users').doc(this.currentUserId)) // not reactive, but is updated real-time
    }
  }
})
```

### Collections

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
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
  data() {
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
  data() {
    const $fiery = this.$fiery
    return {
      // real-time is default, all you need to do is specify once: true to disable it
      cars: $fiery(db.collection('cars'), {once: true}), // array populated once
      currentUser: $fiery(db.collection('users').doc(this.currentUserId), {once: true}), // current user populated once
    }
  }
})
```

### Data or computed

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    // data examples above
    return {
      limit: true,
      status: 'unfinished'
    }
  },
  computed: {
    currentUser() {
      return this.$fiery(db.collection('users').doc(this.currentUserId)) // reactive and real-time
    },
    todos() {
      return this.$fiery(db.collection('todos'), { // reactive and real-time
        query: (todos) => todos
          .where('created_by', '==', this.currentUserId)
          .where('status', '==', this.status)
          .limit(this.limit),
        
      })
    }
  }
})
```

### Adding, updating, overwriting, removing

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    return {
      todos: this.$fiery(db.collection('todos'))
    }
  },
  computed: {
    currentUser() {
      return this.$fiery(db.collection('users').doc(this.currentUserId))
    }
  },
  methods: {
    addTodo() { // COLLECTIONS STORED IN $fires
      // once successful, this.todos will be updated
      this.$fires.todos.add({
        name: 'Like vue-fiery',
        done: true
      })
    },
    updateUser() {
      this.$fiery.update(this.currentUser)
    },
    updateUserEmailOnly() {
      this.$fiery.update(this.currentUser, ['email'])
    },
    updateAny(data) { // any document can be passed, ex: this.todos[1], this.currentUser
      this.$fiery.update(data)
    },
    overwrite(data) { // only fields present on data will exist on set
      this.$fiery.set(data)
    },
    remove(data) {
      this.$fiery.remove(data) // removes sub collections as well
      this.$fiery.remove(data, true) // preserves sub collections
    }
  }
})
```

### Sub-collections

You can pass the same options to sub, nesting as deep as you want!

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      // this.todos[todoIndex].children[childIndex]
      todos: this.$fiery(db.collection('todos'), {
        sub: {
          children: { // creates an array or map on each todo object: todo.children[]
            // once, map, etc
            query: (children) => children.orderBy('updated_at')
          }
        }
      })
    }
  },
  methods: {
    addChild(parent) {
      // or this.$fiery.ref(parent, 'children') for short
      this.$fiery.ref(parent).collection('children').add({
        name: 'Fork vue-fiery',
        done: false
      })
    }
  }
})
```

### Return instances of a class

```javascript
function Todo() {

}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
  }
}

const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      // this.todos[todoIndex] instanceof Todo
      todos: this.$fiery(db.collection('todos'), { type: Todo })
    }
  }
})
```

### Active Record

```javascript
// can be used with type, doesn't have to be
function Todo() {

}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
    this.$update()
  }
}

const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), { 
        type: Todo, record: true
        // $set, $update, $remove, $ref are functions added to every Todo instance
      }),
      todosCustom: this.$fiery(db.collection('todos'), {
        record: true, 
        recordOptions: { // which methods do you want added to every object, and with what method names?
          set: 'set',
          update: 'save',
          remove: 'destory',
          ref: 'ref'
        }
      })
    }
  },
  methods: {
    updateTodoAt(index) {
      // instead of this.$fiery.update(this.todos[index])
      this.todos[index].$update() 
    },
    saveTodoCustomAt(index) {
      // instead of this.$fiery.update(this.todosCustom[index])
      this.todosCustom[index].save()
    },
    done(todo) {
      todo.markDone(this.currentUser) // assuming currentUser exists
    }
  }
})
```

### Save fields

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), { 
        include: ['name', 'done'], // if specified, we ONLY send these fields on set/update
        exclude: ['hidden'] // if specified here, will not be sent on set/update
      }),
    }
  },
  methods: {
    save(todo) {
      this.$fiery.update(todo)
    },
    saveDone(todo) {
      this.$fiery.update(todo, ['done']) // only send this value if it exists
    },
    saveOverride(todo) {
      this.$fiery.update(todo, ['hidden']) // ignores exclude and include when specified
    }
  }
})
```

### Adding key to object

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {key: 'id', exclude: ['id']}) // must be excluded manually
    }
  },
  methods: {
    log(todo) {
      // todo.id exists now
      console.log(todo)
    }
  }
})
```

### Callbacks

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {
        onSuccess: (todos) => {},
        onError: (message) => {},
        onRemove: () => {},
        onMissing: () => {} // occurs for documents
      })
    }
  }
})
```

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
