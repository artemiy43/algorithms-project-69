const search = (documents, query) => {
    if (!documents || !query) {
        return [];
    }

    const terms = query.toLowerCase().match(/\w+/g);
    const invertedDocuments = getInvertIndex(documents);
    const result = [...findNeededDocs(terms, invertedDocuments)];
    const sortedResult = sort(result, documents,invertedDocuments, terms);
    return sortedResult;
};

const getInvertIndex = (docs) => {
    const result = {};
    const words = new Set();

    docs.forEach(doc => {
        doc.text.toLowerCase().match(/\w+/g).forEach(word => {
            words.add(word);
        });
    });

    for (let word of words) {
        if (!result[word]) {
            result[word] = [];
        }

        for (let doc of docs) {
            doc.text.toLowerCase().match(/\w+/g).forEach(docWord => {
                if (docWord === word) {
                    result[word].push(doc.id);
                }
            })
        }
    }

    return result;
};

const findNeededDocs = (terms, invertedDocuments) => {
    const result = new Set();
    for (let term of terms) {
        if (invertedDocuments[term]) {
            for (let doc of invertedDocuments[term]) {
                result.add(doc);
            }
        }
    }

    return result;
};

const sort = (result, documents, invertedDocuments, terms) => {
    const collection = {};
    const countOfDocuments = documents.length;
    console.log(JSON.stringify(countOfDocuments));

    for (let doc of documents) {
        collection[doc.id] = {};
        collection[doc.id].INDEX = 0;
    }

    for (let term of terms) {
        for (let doc of documents) {
            console.log(JSON.stringify(`term: ${term}`));
            console.log(JSON.stringify(`doc: ${JSON.stringify(doc)}`));

            const tf = tfCalculate(term, doc, invertedDocuments);
            const idf = idfCalculate(countOfDocuments, term, invertedDocuments);

            console.log(JSON.stringify(`tf: ${tf}`));
            console.log(JSON.stringify(`idf: ${idf}`));

            collection[doc.id].INDEX += tf * idf;
        }
    }

    console.log(JSON.stringify(collection));

    const answer = Object.entries(collection)
    .filter(entity => result.includes(entity[0]) && entity[1] !== 0)
    .sort((a,b)=> collection[b[0]].INDEX - collection[a[0]].INDEX)
    .map(entity => entity[0]);

    console.log(JSON.stringify(`answer: ${answer}`));

    return answer;
};

const tfCalculate = (term, doc, invertedDocuments) => {
    return invertedDocuments[term] ? (invertedDocuments[term].filter(invertedDoc => invertedDoc === doc.id).length) / doc.text.toLowerCase().match(/\w+/g).length : 0;
};

const idfCalculate = (countOfDocuments, term, invertedDocuments) => {
    const set = invertedDocuments[term] ? new Set(invertedDocuments[term]) : new Set();
    console.log(JSON.stringify(`countOfDocuments: ${countOfDocuments}`));
    console.log(JSON.stringify(`set.size: ${set.size}`));
    return Math.log2(1 + (countOfDocuments - set.size + 1) / (set.size + 0.5));
};

export default search;