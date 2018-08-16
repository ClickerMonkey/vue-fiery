
import { FieryVue, FieryOptions, FieryEntry, FieryData, FierySource, FieryChangesCallback, FieryEquality, FieryFields } from './types'
import { parseDocument, encodeDocument } from './documents'
import { getMetadata, forEach, isEqual, isDefined, isFunction, getFields } from './util'



export function update (this: FieryVue, data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(data)

  if (store && path)
  {
    const values: FieryData = encodeDocument(data, options, fields)

    return store.doc(path).update(values)
  }
}

export function sync (this: FieryVue, data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(data)

  if (store && path)
  {
    const values = encodeDocument(data, options, fields)

    return store.doc(path).set(values)
  }
}

export function remove (this: FieryVue, data: FieryData, excludeSubs: boolean = false): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(data)

  if (store && path)
  {
    if (!excludeSubs && options.sub)
    {
      for (let subProp in options.sub)
      {
        forEach(data[subProp], (sub) =>
        {
          this.remove(sub as FieryData)
        })
      }
    }

    return store.doc(path).delete()
  }
}

export function clear (this: FieryVue, data: FieryData, props: FieryFields): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(data)
  const propsArray: string[] = getFields(props) as string[]

  if (store && path)
  {
    const doc = store.doc(path)
    const deleting: any = {}
    let deleteCount: number = 0

    for (let prop of propsArray)
    {
      if (options.sub && prop in options.sub && data[prop])
      {
        forEach(data[prop], (sub) =>
        {
          this.remove(sub as FieryData)
        })
      }
      else if (prop in data)
      {
        let firebaseRuntime: any = (<any>store.app).firebase_

        if (firebaseRuntime)
        {
          deleting[prop] = firebaseRuntime.firestore.FieldValue.delete()
          deleteCount++
        }
      }
    }

    if (deleteCount > 0)
    {
      return doc.update(deleting)
    }
  }
}

export function getChanges (this: FieryVue, data: FieryData,
  fieldsOrCallback: string[] | FieryChangesCallback,
  callbackOrEquality?: FieryChangesCallback | FieryEquality,
  equalityOrNothing?: FieryEquality): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(data)
  const fields: FieryFields | undefined = isFunction(fieldsOrCallback) ? undefined : getFields(fieldsOrCallback as FieryFields)
  const callback: FieryChangesCallback = (fields ? callbackOrEquality : fieldsOrCallback) as FieryChangesCallback
  const equality: FieryEquality = ((fields ? equalityOrNothing : callbackOrEquality) || isEqual) as FieryEquality

  if (store && path)
  {
    const current: FieryData = encodeDocument(data, options, fields)

    return store.doc(path).get().then((doc) =>
    {
      const encoded: FieryData = parseDocument(doc, options)
      const remote: FieryData = {}
      const local: FieryData = {}
      let changes = false

      for (let prop in current)
      {
        let remoteValue = encoded[prop]
        let localValue = current[prop]

        if (!equality(remoteValue, localValue))
        {
          changes = true
          remote[prop] = remoteValue
          local[prop] = localValue
        }
      }

      callback(changes, remote, local)
    })
  }
}

export function ref (this: FieryVue, data: FieryData, sub?: string): FierySource | undefined
{
  const { store, path } = getMetadata(data)

  if (store && path)
  {
    let doc = store.doc(path)

    return sub ? doc.collection(sub) : doc
  }
}
