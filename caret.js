/* 
    Implement Twitter/Weibo @ mentions

    Copyright (C) 2012 chord.luo@gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/* 本插件操作 textarea 或者 input 内的插入符
 * 只实现了获得插入符在文本框中的位置，我设置
 * 插入符的位置.
 * */
(function($) {
    function getCaretPos(inputor) {
        if ("selection" in document) { // IE
            inputor.focus(); 
            /*  
            // this two implemention can't catch the "\r\n" char.
            var range_sel = document.selection.createRange();
            try {
                var range = inputor.createTextRange(), 
                    range_clone = range.duplicate();
                range_clone.moveToBookmark(range_sel.getBookmark());
                range.setEndPoint('EndToStart',range_clone);
            } catch (e) {
                return 0;
            }
    
            var value = inputor.value;
            try {
                var range = document.selection.createRange ();
                pos = -range.moveStart ('character', -value.length);
            } catch (e) {
                return 0;
            }*/


            /*
            * reference: http://tinyurl.com/86pyc4s
            */
            var start = 0, end = 0, normalizedValue, range,
                    textInputRange, len, endRange;
            var el = inputor;
            /* assume we select "HATE" in the inputor such as textarea -> { }.
            *               start end-point.
            *              /
            * <  I really [HATE] IE   > between the brackets is the selection range.
            *                   \
            *                    end end-point.
            */
            range = document.selection.createRange();
            pos = 0;
            // selection should in the inputor.
            if (range && range.parentElement() == el) {
                normalizedValue = el.value.replace(/\r\n/g, "\n");
                /* "/r/n" is counted as two char.
                 * one line is two, two will be four. balalala.
                 * so we have to using the normalized one's length.;
                 */
                len = normalizedValue.length;

                /*<[  I really HATE IE   ]>:
                 * the whole content in the inputor will be the textInputRange.
                 */
                textInputRange = el.createTextRange();

                /*                 _here must be the position of bookmark.
                 *                /
                 *  <[  I really [HATE] IE   ]>
                 *   [---------->[           ] : this is what moveToBookmark do.
                 *  <   I really [[HATE] IE   ]> : here is result.
                 *                 \ two brackets in should be in line.
                 */
                textInputRange.moveToBookmark(range.getBookmark());
                // IE don't want to let "createTextRange" and "collapse" get together. It's so bad
                endRange = el.createTextRange();
                
                /*  [--------------------->[] : if set false all end-point goto end.
                 * <  I really [[HATE] IE  []]>
                 */
                endRange.collapse(false);
                /*               ___VS____
                *               /         \
                * <   I really [[HATE] IE []]>
                *                          \_endRange end-point.
                *
                * " > -1" mean the start end-point will be the same or right to the end end-point
                * simplelly, all in the end.
                */
                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    // TextRange object will miss "\r\n". So, we count it ourself.
                    line_counter = normalizedValue.slice(0, start).split("\n").length -1;
                    //alert($("</div>").text(normalizedValue).html());
                    //alert(normalizedValue+":"+len);
                    // I test it for million times and get this code. 
                    // I don't konw show it work yet.
                    start = end = len - line_counter;
                } else {
                    /*        I really |HATE] IE   ]> 
                     *               <-|
                     *      I really[ [HATE] IE   ]>
                     *            <-[
                     *    I reall[y  [HATE] IE   ]>
                     * 
                     *  will return how many unit have moved.
                     */
                    start = -textInputRange.moveStart("character", -len);
                    end = -textInputRange.moveEnd("character", -len);
                }
            }
        } else {
            start = inputor.selectionStart;
        }
        return start;
    }
    function setCaretPos(inputor, pos) {
        if ("selection" in document) { //IE
            range = inputor.createTextRange();
            range.move('character',pos);
            range.select();
        } else 
            inputor.setSelectionRange(pos,pos);
    }
    $.fn.caretPos = function(pos) {
        var inputor = this[0];
        if (pos) {
            return setCaretPos(inputor,pos);
        } else {
            return getCaretPos(inputor);
        }
    }
})(jQuery);