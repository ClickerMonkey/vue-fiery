
import { FieryVue, FieryOptions, FieryEntry, FieryData, FierySource, FieryChangesCallback, FieryEquality } from './types'
import { parseDocument } from './documents'
import { getMetadata, forEach, isEqual } from './util'



export function update (this: FieryVue, data: FieryData, fields?: string[]): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

  if (store && path)
  {
    const values: FieryData = getValues(data, options, fields)

    return store.doc(path).update(values)
  }
}

export function sync (this: FieryVue, data: FieryData, fields?: string[]): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

  if (store && path)
  {
    const values = getValues(data, options, fields)

    return store.doc(path).set(values)
  }
}

export function remove (this: FieryVue, data: FieryData, excludeSubs: boolean = false): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

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

export function clear (this: FieryVue, data: FieryData, props: string | string[]): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)
  const propsArray: string[] = props instanceof Array ? props : [props]

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
  const { store, path, options } = getMetadata(this, data)
  const fields: string[] | undefined = typeof fieldsOrCallback === 'string' ? fieldsOrCallback as string[] : undefined
  const callback: FieryChangesCallback = (fields ? callbackOrEquality : fieldsOrCallback) as FieryChangesCallback
  const equality: FieryEquality = ((fields ? equalityOrNothing : callbackOrEquality) || isEqual) as FieryEquality

  if (store && path)
  {
    const current: FieryData = getValues(data, options, fields)

    return store.doc(path).get().then((doc) =>
    {
      const encoded: FieryData = parseDocument(doc, options)
      const updated: FieryData = {}
      const old: FieryData = {}
      let changes = false

      for (let prop in current)
      {
        let valueUpdated = encoded[prop]
        let valueOld = current[prop]

        if (!equality(valueOld, valueUpdated))
        {
          changes = true
          updated[prop] = valueUpdated
          old[prop] = valueOld
        }
      }

      callback(changes, updated, old)
    })
  }
}

export function ref (this: FieryVue, data: FieryData, sub?: string): FierySource | undefined
{
  const { store, path } = getMetadata(this, data)

  if (store && path)
  {
    let doc = store.doc(path)

    return sub ? doc.collection(sub) : doc
  }
}

export function getValues (data: FieryData, options: FieryOptions, fields?: string[]): FieryData
{
  const explicit: string[] = fields || options.include
  const values: FieryData = {}

  if (explicit)
  {
    for (let i = 0; i < explicit.length; i++)
    {
      let prop: string = explicit[i]

      if (prop in data)
      {
        values[prop] = data[prop]
      }
    }
  }
  else
  {
    for (let prop in data)
    {
      if (!(prop in options.exclude))
      {
        values[prop] = data[prop]
      }
    }
  }

  if (options.encoders)
  {
    for (let prop in options.encoders)
    {
      if (prop in values)
      {
        values[prop] = options.encoders[prop](values[prop], data)
      }
    }
  }

  return values
}
