from pathlib import Path
import base64

output = Path('/Users/terecal/pilot-project/sample-pkt-project/output/pdf/tikitaka-app-introduction.html')
source = Path('/var/folders/4h/z2zcntnn26v1szhfnc6m0t3w0000gn/T/codex-clipboard-09218608-3633-41b1-93fd-4d463a0d592d.png')
html = output.read_text(encoding='utf-8')
marker = '__TIKITAKA_API_HELPER_IMAGE__'
assert html.count(marker) == 1
uri = 'data:image/png;base64,' + base64.b64encode(source.read_bytes()).decode('ascii')
output.write_text(html.replace(marker, uri), encoding='utf-8')
print('Embedded original screenshot in HTML')
