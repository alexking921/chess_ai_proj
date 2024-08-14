
function point_eval_white(boardObj) 
{
    if (boardObj.eval != null) return boardObj.eval;
    const {board, meta} = boardObj;

    let eval = 0;
    [...board].forEach((cell) => {
        switch (cell) {
            case 'q':
                eval += 9;
                break;
            case 'Q':
                eval -= 9;
                break;
            case 'r':
                eval += 5;
                break;
            case 'R':
                eval -= 5;
                break;
            case 'b':
                eval += 3;
                break;
            case 'B':
                eval -= 3;
                break;
            case 'n':
                eval += 3;
                break;
            case 'N':
                eval -= 3;
                break;
            case 'p':
                eval += 1;
                break;
            case 'P':
                eval -= 1;
                break;
        }
    });

    boardObj.eval = null;
    return eval / 64;
}

function point_eval_black(boardObj)
{
    return -point_eval_white(boardObj);
}

function pawn_position_value(ind, isWhite)
{
    return isWhite ? pawnVals[ind] : -pawnVals[63-ind];
}

function depth_cutoff(boardObj, depth, evalHistory)
{
    return depth < 0;
}

function bad_move_cutoff(boardObj, depth, evalHistory)
{
    if (evalHistory.length > 1 && evalHistory[0] - evalHistory[1] < 0) return true;
    return depth < 0;
}

function alpha_beta_cuffoff(boardObj, eval, cutoff, maxDepth) 
{
    const {board, meta} = boardObj;

    isWhite = getWhiteToMove(meta);
    const curEval = eval(boardObj);
    const [value, move] = max_value_abc(boardObj, eval, cutoff, maxDepth, -Infinity, Infinity, [curEval]);
    return move;
}

function max_value_abc(boardObj, eval, cutoff, depth, alpha, beta, evalHistory) 
{
    if (isTerminal(boardObj))
    {
        return [utility(boardObj), null];
    }
    else if (cutoff(boardObj, depth, evalHistory))
    {
        return [eval(boardObj), null];
    }

    let value = -Infinity;
    let move = null;
    const isWhite = getWhiteToMove(boardObj.meta);
    const actions = getAllMoves(boardObj, isWhite);
    const actionEvals = actions.map((action) => {
        const result = takeAction(boardObj, action[0][0], action[0][1], action[1][0], action[1][1]);
        return [action, result, eval(result)];
    })
    actionEvals.sort((a,b) => (b[2] - a[2])); // difference in evals s.t. higher evals are earlier in the list
    actionEvals.forEach((actionEval) => {
        const [action, result, actEval] = actionEval;
        const [v2, a2] = min_value_abc(result, eval, cutoff, depth-1, alpha, beta, [actEval, ...evalHistory]);
        if (v2 > value)
        {
            value = v2;
            move = action;
            alpha = max(value, alpha);
        }
        if (value >= beta) return [value, move];
    });

    return [value, move];
}

function min_value_abc(boardObj, eval, cutoff, depth, alpha, beta, evalHistory)
{
    if (isTerminal(boardObj))
    {
        return [utility(boardObj), null];
    }
    else if (cutoff(boardObj, depth, evalHistory))
    {
        return [eval(boardObj), null];
    }

    let value = Infinity;
    let move = null;
    const isWhite = getWhiteToMove(boardObj.meta);
    const actions = getAllMoves(boardObj, isWhite);
    const actionEvals = actions.map((action) => {
        const result = takeAction(boardObj, action[0][0], action[0][1], action[1][0], action[1][1]);
        return [action, result, eval(result)];
    })
    actionEvals.sort((a,b) => (b[2] - a[2])); // difference in evals s.t. higher evals are earlier in the list
    actionEvals.forEach((actionEval) => {
        const [action, result, actEval] = actionEval;
        const [v2, a2] = max_value_abc(result, eval, cutoff, depth-1, alpha, beta, [actEval, ...evalHistory]);
        if (v2 < value)
        {
            value = v2;
            move = action;
            beta = min(value, beta);
        }
        if (value <= alpha) return [value, move];
    });

    return [value, move];
}