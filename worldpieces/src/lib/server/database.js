import pkg from 'lodash';
const {sortBy} = pkg;
import { onMount } from 'svelte'
import PouchDB from 'pouchdb'
// Set up local PouchDB and continuous replication to remote CouchDB
let db = new PouchDB('db')
const replication = PouchDB.sync('db', 'http://localhost:5984/world_pieces', {
    live: true,
    retry: true
}).on('change', async function (info) {
    await updatePieces()
}).on('error', function (err) {
    console.log('Replication error:', err)
})
// Set up our vars and defaults
let newPiece = ''
let sortByWhat = 'createdAt'
let filterByWhat = ''
let isLoading = true
// All the pieces directly from the PouchDB. Sorting and filtering comes later
let pieces = []
// $: sortedAndFilteredpieces = sortBy(pieces, [sortByWhat]).filter((piece) => {
//     const [filterKey, filterValue] = filterByWhat.split(':')
//     // Only filter if there’s a proper filter set
//     return filterKey && filterValue ? piece[filterKey].toString() === filterValue : true
// })
// Helper for reloading all pieces from the local PouchDB. It’s on-device and has basically zero latency,
// so we can use it quite liberally instead of keeping our local state up to date like you’d do
// in a Redux reducer. It also saves us from having to rebuild the local state pieces from the data we sent
// to the database and the `_id` and `_rev` values that were sent back.
async function updatepieces() {
    const allDocs = await db.allDocs({
        include_docs: true
    })
    pieces = allDocs.rows.map(row => row.doc)
    isLoading = false
}
export const actions = {
	create: async (event) => {
		const newpiece = {
            text: newPiece,
            complete: false,
            createdAt: new Date().toISOString()
        }
        const addition = await db.post(newpiece)
        if (addition.ok) {
            await updatepieces()
        }
        newPiece = ''
	},
	delete: async (event) => {
        const { piece: pieceToRemove } = event.detail
        const removal = await db.remove(pieceToRemove)
        if (removal.ok) {
            // For removal, we can just update the local state instead of reloading everything from PouchDB,
            // since we no longer care about the doc’s revision.
            pieces = pieces.filter((piece) => {
                return piece._id !== pieceToRemove._id
            })
        }
	}
};
// Event handlers for adding, updating and removing pieces
async function add(event) {
    const newpiece = {
        text: newPiece,
        complete: false,
        createdAt: new Date().toISOString()
    }
    const addition = await db.post(newpiece)
    if (addition.ok) {
        await updatepieces()
    }
    newPiece = ''
}
async function updateStatus(event) {
    const { piece } = event.detail
    const update = await db.put(piece)
    if (update.ok) {
        await updatepieces()
    }
}
async function removeItem(event) {
    const { piece: pieceToRemove } = event.detail
    const removal = await db.remove(pieceToRemove)
    if (removal.ok) {
        // For removal, we can just update the local state instead of reloading everything from PouchDB,
        // since we no longer care about the doc’s revision.
        pieces = pieces.filter((piece) => {
            return piece._id !== pieceToRemove._id
        })
    }
}
// Load pieces on first run
onMount(async () => {
    await updatepieces()
})