const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

require('dotenv').config();

const {
    introspectionQuery,
    buildClientSchema,
    printSchema,
} = require('graphql');

const writeFile = promisify(fs.writeFile);
const execute = promisify(exec);

const PRISMIC_REPOSITORY = process.env.PRISMIC_REPOSITORY;
const PRISMIC_REPOSITORY_URL = process.env.PRISMIC_REPOSITORY_URL || `https://${PRISMIC_REPOSITORY}.prismic.io`;

async function getPrismicRef(id = 'master') {
    return fetch(`${PRISMIC_REPOSITORY_URL}/api/v2`)
        .then(result => result.json())
        .then(json => json.refs)
        .then(refs => refs.find(ref => ref.id === id));
}

async function getRemoteSchema(endpoint, options) {
    let url = endpoint + `?query=${encodeURIComponent(introspectionQuery)}`;
    return fetch(url, {
        method: 'GET',
        headers: options.headers,
    })
        .then(res => res.json())
        .then(json => buildClientSchema(json.data))
        .then(schema => printSchema(schema));
}

async function writeToFile(destination, schema) {
    const output = path.resolve(process.cwd(), destination);
    return writeFile(output, schema).then(() =>
        execute('./node_modules/.bin/prettier --write schema/schema.graphql ')
    );
}

process.on('unhandledRejection', error => {
    console.error('Failed to get Graphql schema 🙅‍♀️\n', error.message);
});

(async () => {
    const master = await getPrismicRef();
    const schema = await getRemoteSchema(`${PRISMIC_REPOSITORY_URL}/graphql`, {
        headers: {
            'Prismic-Ref': master.ref,
        },
    });

    await writeToFile('./schema/schema.graphql', schema);
    console.log('Graphql schema updated 🆒');
})();
