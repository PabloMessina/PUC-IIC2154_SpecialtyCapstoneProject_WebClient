module.exports = [{
    id: 1,
    qtype: 'multiChoice',
    content: {
        insert: '¿Sed ut posuere velit?'
    },
    tags: ['Tag 1', 'Tag 2'],
    fields: {
        selectable: 1,
        choices: [{
            text: 'Option 1'
        }, {
            text: 'Option 2'
        }],
    },
    answer: [1],
}, {
    id: 2,
    qtype: 'multiChoice',
    content: {
        insert: ' Phasellus nec tortor vel dui ultrices facilisis.' +
            'Vestibulum nec turpis vitae est interdum porttitor sed nec enim.' +
            'Curabitur vel viverra mi, tempor aliquet nisl.'
    },
    tags: ['Tag 1'],
    fields: {
        selectable: 1,
        choices: [{
            text: 'Option 1'
        }, {
            text: 'Option 2'
        }],
    },
    answer: [1],
}, {
    id: 3,
    qtype: 'tshort',
    content: {
        insert: 'Aliquam tempor risus dui, non sodales velit tempor quis.' +
            'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
            'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. '
    },
    tags: ['Tag 2', 'Tag 3', 'Tag 4'],
    fields: {},
    answer: ['Answ 1', 'Answ 2', 'Answ 3'],
}, {
    id: 4,
    qtype: 'tshort',
    content: {
        insert: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
            'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. '
    },
    tags: ['Tag 2', 'Tag 3', 'Tag 4'],
    fields: {},
    answer: ['Answ 1', 'Answ 2'],
}, {
    id: 5,
    qtype: 'trueFalse',
    content: {
        insert: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
            'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. '
    },
    tags: ['Tag 5'],
    fields: {},
    answer: 1,
}];
