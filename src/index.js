const getInvertIndex = (docs) => {
  const result = {};
  const words = new Set();

  docs.forEach((doc) => {
    doc.text.toLowerCase().match(/\w+/g).forEach((word) => {
      words.add(word);
    });
  });

  words.forEach((word) => {
    if (!result[word]) {
      result[word] = [];
    }

    docs.forEach((doc) => {
      doc.text.toLowerCase().match(/\w+/g).forEach((docWord) => {
        if (docWord === word) {
          result[word].push(doc.id);
        }
      });
    });
  });

  return result;
};

const findNeededDocs = (terms, invertedDocuments) => {
  const result = new Set();
  terms.forEach((term) => {
    if (invertedDocuments[term]) {
      invertedDocuments[term].forEach((doc) => {
        result.add(doc);
      });
    }
  });

  return result;
};

const tfCalculate = (term, doc, invertedDocuments) => (invertedDocuments[term] ? (invertedDocuments[term].filter((invertedDoc) => invertedDoc === doc.id).length) / doc.text.toLowerCase().match(/\w+/g).length : 0);

const idfCalculate = (countOfDocuments, term, invertedDocuments) => {
  const set = invertedDocuments[term] ? new Set(invertedDocuments[term]) : new Set();
  return Math.log2(1 + (countOfDocuments - set.size + 1) / (set.size + 0.5));
};

const sort = (result, documents, invertedDocuments, terms) => {
  const collection = {};
  const countOfDocuments = documents.length;

  documents.forEach((doc) => {
    collection[doc.id] = {};
    collection[doc.id].INDEX = 0;
  });

  terms.forEach((term) => {
    documents.forEach((doc) => {
      const tf = tfCalculate(term, doc, invertedDocuments);
      const idf = idfCalculate(countOfDocuments, term, invertedDocuments);

      collection[doc.id].INDEX += tf * idf;
    });
  });

  const answer = Object.entries(collection)
    .filter((entity) => result.includes(entity[0]) && entity[1] !== 0)
    .sort((a, b) => collection[b[0]].INDEX - collection[a[0]].INDEX)
    .map((entity) => entity[0]);

  return answer;
};

const search = (documents, query) => {
  if (!documents || !query) {
    return [];
  }

  const terms = query.toLowerCase().match(/\w+/g);
  const invertedDocuments = getInvertIndex(documents);
  const result = [...findNeededDocs(terms, invertedDocuments)];
  const sortedResult = sort(result, documents, invertedDocuments, terms);
  return sortedResult;
};

export default search;
