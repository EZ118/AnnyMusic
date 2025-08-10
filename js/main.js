$(document).ready(() => {
    $.get("./render_music_source.js", (sourceScript) => {
        const interpreter = new Sval({
          ecmaVer: 'latest',
          sourceType: 'script',
          // Whether the code runs in a sandbox
          sandBox: true,
        })
        
        interpreter.import({
            lx: LxApi
        });

        interpreter.run(sourceScript)
        
        
        LxApi._emit(LxApi.EVENT_NAMES.request, {
          source: 'kw',
          action: 'musicUrl',
          info: { type: '320k', musicInfo: { songmid: '188247885' } }
        }).then((a) => {
          console.log('脚本里的 request handler 已经执行完成', a); // 'a' 现在应该是 musicUrl
        });
    })
});