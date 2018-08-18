
import * as firebase from 'firebase'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type GetOptions = firebase.firestore.GetOptions
type Firestore = firebase.firestore.Firestore
type QueryListenOptions = firebase.firestore.QueryListenOptions
type DocumentListenOptions = firebase.firestore.DocumentListenOptions
type DocumentReference = firebase.firestore.DocumentReference
type CollectionReference = firebase.firestore.CollectionReference
type DocumentSnapshot = firebase.firestore.DocumentSnapshot



export type FieryData = { [prop: string]: any }

export type FieryMap = { [key: string]: FieryData }

export type FieryTarget = FieryData[] | FieryData | FieryMap

export type FieryExclusions = { [field: string]: boolean }

export type FierySource = Query | DocumentReference | CollectionReference

export type FierySources = { [name: string]: FierySource }

export type FieryEntryMap = { [key: string]: FieryEntry }

export type FieryChangesCallback = (changes: boolean, remote: FieryData, local: FieryData) => any

export type FieryEquality = (a: any, b: any) => boolean

export type FieryMergeStrategy = (a: any, b: any) => any

export type FieryMergeStrategies = { [option: string]: FieryMergeStrategy }

export type FieryOptionsMap = { [name: string]: Partial<FieryOptions> }

export type FieryOptionsInput = string | Partial<FieryOptions>

export type FieryFields = string | string[]

export type FieryCache = { [uid: string]: FieryCacheEntry }


export interface FierySystem
{
  removeNamed: (name: string) => any

  setProperty: (target: any, property: string, value: any) => any

  removeProperty: (target: any, property: string) => any

  arrayInsert: (target: any[], index: number, value: any) => any

  arrayRemove: (target: any[], index: number) => any

  arrayMove: (target: any[], fromIndex: number, toIndex: number, value: any) => any

  arraySet: (target: any[], index: number, value: any) => any

  arrayAdd: (target: any[], value: any) => any

  arrayClear: (target: any[]) => any
}

export interface FieryOptions
{

  extends?: FieryOptionsInput

  id: number

  shared: boolean

  instance?: FieryInstance

  key?: string

  query?: (source: FierySource) => FierySource

  map?: boolean

  doc?: boolean

  once?: boolean

  type?: { new (): FieryData }

  newDocument: (encoded?: FieryData) => FieryData

  newCollection: () => FieryMap | FieryData[]

  decode?: (encoded: FieryData) => FieryData

  decoders?:
  {
    [prop: string]: (a: any, encoded: FieryData) => any
  },

  encoders?:
  {
    [prop: string]: (a: any, data: FieryData) => any
  },

  record?: boolean

  recordOptions:
  {
    sync?: string
    update?: string
    remove?: string
    ref?: string
    clear?: string
    getChanges?: string
    [unspecified: string]: any
  }

  propValue: string

  onceOptions?: GetOptions

  liveOptions: QueryListenOptions | DocumentListenOptions

  exclude: FieryExclusions | string[]

  include: string[]

  onError: (error: any) => any

  onSuccess: (target: FieryTarget) => any

  onMissing: () => any

  onRemove: () => any

  parent?: FieryOptions

  sub?:
  {
    [subProp: string]: FieryOptions
  }

}

export interface FieryInstance
{

  (source: FierySource, options?: FieryOptionsInput, name?: string): FieryTarget

  system: FierySystem

  options:
  {
    [optionKey: number]: FieryOptions
  }

  sources:
  {
    [name: string]: FierySource
  }

  entry: FieryEntryMap

  entryList: (FieryEntry | null)[]

  cache: FieryCache

  update: (data: FieryData, fields?: FieryFields) => Promise<void> | undefined

  sync: (data: FieryData, fields?: FieryFields) => Promise<void> | undefined

  remove: (data: FieryData) => Promise<void> | undefined

  clear: (data: FieryData, props: FieryFields) => Promise<void> | undefined

  getChanges: (data: FieryData,
    fieldsOrCallback: FieryFields | FieryChangesCallback,
    callbackOrEquality?: FieryChangesCallback | FieryEquality,
    equalityOrNothing?: FieryEquality) => Promise<void> | undefined

  ref: (data: FieryData) => FierySource | undefined

  destroy: () => void
}

export interface FieryMetadata
{

  uid: string

  path: string

  storeKey: number

  store: Firestore

  optionKey: string

  options: FieryOptions

}

export interface FieryEntry
{

  name?: string

  options: FieryOptions

  source: FierySource

  instance: FieryInstance

  storeKey: number

  target?: FieryTarget

  children: FieryCache

  recordFunctions:
  {
    sync: (fields?: FieryFields) => any
    update: (fields?: FieryFields) => any
    remove: (excludeSubs: boolean) => any
    ref: (sub?: string) => any
    clear: (props: FieryFields) => any
    getChanges: (fieldsOrCallback: FieryFields | FieryChangesCallback,
      callbackOrEquality?: FieryChangesCallback | FieryEquality,
      equalityOrNothing?: FieryEquality) => any
  }

  promise?: Promise<QuerySnapshot>

  off?: () => any

  id?: number

  index?: number,

  live: boolean

}

export interface FieryCacheEntry
{

  uid: string

  data: FieryData

  doc?: DocumentSnapshot

  uses: number

  sub: FieryEntryMap

  firstEntry: FieryEntry

  entries: FieryEntry[]

  removed: boolean

}
