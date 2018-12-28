
/*
* 
*/
define('/Game/Table/Collection', function (require, module, exports) {
    var KISP = require('KISP');



    /**
    * 获取指定单元格的周围 8 格子。
    */
    function getNeighbors(cell) {
        var table = cell.table;     //
        var x = cell.index;         //列号。
        var y = cell.row.index;     //行号。

        var list = [
            table[y - 1][x - 1],
            table[y - 1][x + 0],
            table[y - 1][x + 1],

            table[y + 0][x - 1],
            table[y + 0][x + 1],

            table[y + 1][x - 1],
            table[y + 1][x + 0],
            table[y + 1][x + 1],
        ];

        return list;
    }

    
    /**
    * 收集需要变色的格子。
    */
    function collect(todos, cell) {
        var table = cell.table;
        var x = cell.index;         //列号。
        var y = cell.row.index;     //行号。


        var isBorder =
            x == 0 || x == cell.row.length - 1 ||
            y == 0 || y == table.length - 1;

        if (isBorder) {
            return;
        }


        var neighbors = getNeighbors(cell);
        var count = 0;

        neighbors.forEach(function (cell) {
            if (cell.data.checked) {
                count++;
            }
        });


        //1，如果一个格子周围有 3 个格子为白，则该格子为白。
        if (count == 3) {
            if (!cell.data.checked) {
                todos.push(cell);
            }
            return;
        }

        //2，如果一个格子周围有 2 个格子为白，则该格子颜色不变。
        if (count == 2) {
            return;
        }


        //3，如果一个格子周围白色格子少于 2 个，则该格子为黑。
        if (count < 2) {
            if (cell.data.checked) {
                todos.push(cell);
            }

            return;
        }

        //4，如果一个格子周围有超过 3 个格子为白，则该格子为黑。
        if (count > 3) {
            if (cell.data.checked) {
                todos.push(cell);
            }

            return;
        }


    }



    return {
        /**
        * 
        */
        get: function (table) {
            var todos = [];

            table.each(function (cell) {
                collect(todos, cell);
            });

            return todos;
            
        },

    };




});



