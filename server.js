const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 5000

const allowedOrigins = [
	'https://item-list-frontend.vercel.app/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json())

const ITEMS_COUNT = 50_000

let items = Array.from({ length: ITEMS_COUNT }, (_, i) => ({
	id: i + 1,
	selected: false,
}))

let orderedItems = items.map(item => item.id)

app.get('/api/items', (req, res) => {
	let { search = '', offset = 0, limit = 20 } = req.query

	const searchLower = search.toLowerCase()

	let filteredIds
	if (!search.trim()) {
		filteredIds = orderedItems
	} else {
		filteredIds = orderedItems.filter(id => `item #${id}`.includes(searchLower))
	}

	const paginatedIds = filteredIds.slice(+offset, +offset + +limit)

	res.json({
		items: paginatedIds.map(id => ({
			id,
			selected: items[id - 1].selected,
		})),
		total: filteredIds.length,
	})
})

app.post('/api/items/order', (req, res) => {
	const { orderedIds } = req.body

	const newOrdered = []

	let used = new Set(orderedIds)

	newOrdered.push(...orderedIds)

	orderedItems.forEach(id => {
		if (!used.has(id)) {
			newOrdered.push(id)
		}
	})

	orderedItems = newOrdered

	res.status(200).send()
})

app.get('/api/selected', (req, res) => {
	const selectedItems = items
		.filter(item => item.selected)
		.map(item => ({
			id: item.id,
			selected: item.selected,
		}))

	res.json(selectedItems)
})

app.post('/api/items/select', (req, res) => {
	const { id, selected } = req.body
	items[id - 1].selected = selected
	res.status(200).send()
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
