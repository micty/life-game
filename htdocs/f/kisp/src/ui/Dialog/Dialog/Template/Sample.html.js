/*
* Dialog/Template/Sample
* 由 kisp-packer 生成。 
* 来源: ../build/pc/8.1.0/src/ui/dialog/Dialog/Template/Sample.html
*/
define('Dialog/Template/Sample', [
    '',
    '<div id="{id}" class="KISP Dialog {cssClass}" style="{style} display: none;">',
    '    <template name="header" placeholder="header">',
    '        <header id="{headerId}">',
    '            {title}',
    '        </header>',
    '    </template>',
    '',
    '    <template name="content" placeholder="content">',
    '        <article class="{noHeader} {noFooter}">',
    '            <div id="{contentId}">{content}</div>',
    '        </article>',
    '    </template>',
    '',
    '    <template name="footer" placeholder="footer">',
    '        <footer id="{footerId}" class="Buttons-{count}">',
    '            <template name="button" placeholder="buttons">',
    '                <button data-index="{index}" class="{cssClass}" style="{style}">{text}</button>',
    '            </template>',
    '        </footer>',
    '    </template>',
    '</div>',
    '',
].join('\n'));
