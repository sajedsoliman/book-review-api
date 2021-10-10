const booksDB = [
	{
		author: "Micheal Jackson",
		title: "React Best Practices",
		publishedDate: new Date("2019/8/2"),
		pagesCount: 200,
		reviews: [
			{
				reviewer: "Sajid",
				review: "Great book in terms of readability and legibility",
			},
		],
	},
];

db.books.deleteMany({});

db.books.insertMany(booksDB);
const count = db.books.countDocuments();
print(`There ${count} in the DB`);

db.books.createIndex({ author: 1 });
db.books.createIndex({ title: 1 });
db.books.createIndex({ publishedDate: 1 });
