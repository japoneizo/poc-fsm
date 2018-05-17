'use strict';

const { Machine } = require('xstate');
const smcat = require("state-machine-cat");
var fs = require('fs');

const simpleMachine = Machine({
    key: 'simpleMachine',
    initial: 'state1',
    strict: true,
    states: {
        state1: {
            on: {
                TRANSACTION1: {
                    state2: {
                        actions: [{
                            type: 'onTransitionFromState1ToState2',
                        }],
                        cond: (extState, eventObj) => {
                            console.log(`extState: ${JSON.stringify(extState)}`);
                            console.log(`eventObj: ${JSON.stringify(eventObj)}`);
                            return extState.anyValueIWant;
                        }
                    }
                },
            },
            onEntry: [{
                type: 'onEntryState1',
            }]
        },
        state2: {
            on: {
                TRANSACTION2: 'state3',
                TRANSACTION3: 'state4',
            },
            onEntry: [{
                type: 'onEntryState2',
            }],
        },
        state3: {
            on: {
                TRANSACTION4: 'state4',
            },
            onEntry: [{
                type: 'onEntryState3',
            }],
        },
        state4: {
            on: {
                TRANSACTION5: 'state5',
            }
        },
    }
});

const actionExecutor = {
    onEntryState1: () => {
        console.log('In onEntryState1...');
    },
    onEntryState2: () => {
        console.log('In onEntryState2...');
    },
    onEntryState3: () => {
        console.log('In onEntryState3...');
    },
    onTransitionFromState1ToState2: () => {
        console.log('In onTransitionFromState1ToState2...');
    }
};

const handleTrasition = () => {
    let nextState = transition.value;
    console.log(`nextState: ${nextState}`);
    console.log(`actions: ${JSON.stringify(transition.actions)}`);
    if (transition.actions) {
        transition.actions.forEach((action) => {
            actionExecutor[action.type]();
        });
    }
};

const actionTransition = {
    type: 'TRANSACTION1',
    moreInfo: { foo: 'bar' },
}

const initialState = 'state1';

const extendedState = {
    type: initialState,
    anyValueIWant: 'test'
};

let transition = simpleMachine
    .transition(initialState, actionTransition, extendedState);

handleTrasition(transition);

transition = simpleMachine
    .transition(transition.value, 'TRANSACTION2');

handleTrasition(transition);

const handleTransaction = (currentState, transaction) => {
    const edge = `${currentState} => ${transaction.target};`;
    console.log(edge);
    return edge;
};

const handleState = (stateName, state) => {
    var edges = [];
    if (state.on) {
        for (var transitionName in state.on) {
            var transactions = state.on[transitionName];
            transactions.forEach((transaction) => {
                edges.push(handleTransaction(stateName, transaction));
            });
        }
    }

    return edges;
};

const buildEdges = (machine) => {
    let edges = [];

    for (var key in machine.states) {
        edges = edges.concat(handleState(key, machine.states[key]));
    }

    return edges;
};

const generateSvg = (edges) => {
    const edgesAsString = edges.join('');

    try {
        const lSVGInAString = smcat.render(edgesAsString,
            {
                outputType: "svg"
            }
        );

        fs.writeFile(process.cwd() + '/machine.svg', lSVGInAString, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    } catch (pError) {
        console.error(pError);
    }
};

const allEdges = buildEdges(simpleMachine);
generateSvg(allEdges);
