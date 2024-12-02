---
title: Kubernetes のヘルスチェック Liveness, Readiness, Startup Probe についてまとめてみた
date: "2022-04-20"
tags: ["k8s", "Container"]
draft: false
summary: k8s の Pod へのヘルスチェックを行う機能の種類や方式についてまとめてみた
---

## はじめに

Kubernetes（以下 k8s）には、Pod へのヘルスチェックを行う機能がある。その種類・方式をつい忘れてしまうのでまとめてみた。便利な機能なので、それぞれの特徴や違いを理解してより活用していきたい。

前提として、今回使用した環境は以下になる。

- Docker Desktop for Mac
- Kubernetes v1.22.1

## 結論

まず、最初に結論から。まとめると下記のようになる。

- ヘルスチェックの種類
  - `LivenessProbe`：Pod 内のコンテナが正常に動いているかを確認
  - `ReadinessProbe`：Pod 内のコンテナがリクエストに応答する準備ができているか確認
  - `StartupProbe`：Pod の初回起動が完了したかを確認
- ヘルスチェック方式
  - `ExecAction`：コンテナ内で任意のコマンドを実行。コマンドのステータスが 0 で終了したら成功。
  - `HTTPGetAction`：Pod の特定の IP、ポート、パスに対して HTTP GET リクエストを送信。レスポンスが 200 以上 400 未満だったら成功。
  - `TCPSocketAction`：Pod の特定の IP に対して TCP チェックを行う。ポートが空いていれば成功。

## ヘルスチェック方式

ヘルスチェック方式については、種類に限らず全て同じなので順番が前後するが先に解説する。

それぞれ YAML の例を書いているが、`kubectl explain pod.spec.containers.livenessProbe --recursive` で確認できる。

### ExecAction

コンテナ内で任意のコマンドを実行し、その終了コードにより状態を確認する方式。終了コードが 0 だと成功、1 だと失敗となる。

```yaml showLineNumbers
spec:
  containers:
    - livenessProbe:
        exec:
          command:
            - cat
            - /tmp/healty
```

### HTTPGetAction

Pod の特定の IP、ポート、パスに対して HTTP GET リクエストを送信することで状態を確認する方式。レスポンスのステータスコードが 200 から 399 の場合を成功、それ以外の場合を失敗となる。

```yaml showLineNumbers
spec:
  containers:
    - livenessProbe:
        httpGet:
          path: /health
          port: 8080
          schema: HTTP
          httpHeaders:
            - name: X-Custom-Header
              value: Awesome
```

### TCPSocketAction

Pod の特定の IP に対して TCP チェックを行うことで状態を確認する方式。TCP セッションを確立できると成功になり、できないと失敗になる。

```yaml showLineNumbers
spec:
  containers:
    - livenessProbe:
        tcpSocket:
          port: 8080
```

## LivenessProbe

`LivenessProbe` は、コンテナが正常に動作しているかどうかを確認する役割。

アプリケーションのバグやメモリ不足など、様々な理由でコンテナは応答不可になる。勝手にコンテナがクラッシュする場合は必要ない[^1]が、再起動なしでは回復しづらいコンテナに設定すると良い。

ここでは TCPSocketAction での挙動を見ていく。

まずは、下記の YAML ファイルを適用して Pod を作成する。

```yaml showLineNumbers
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: liveness
  name: liveness
spec:
  containers:
    - image: nginx
      name: liveness
      livenessProbe:
        tcpSocket:
          port: 8080
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

Pod の状態を watch オプションで見てみると、30 秒毎[^2]に Restart されるのが確認できる。

```shell
$ k get po -w
NAME       READY   STATUS    RESTARTS   AGE
liveness   1/1     Running   3          97s
liveness   1/1     Running   4          2m4s
```

今回利用している Nginx イメージは 80 番ポートを LISTEN している。そのため 8080 番ポートだと TCP コネクションが失敗する。（試しに `spec.containers[0].livenessProbe.tcpSocket.port` を 80 に変えてやってみると Restart しないはずだ）

イベントログを確認すると、livenessProbe によるチェックで失敗しているのが分かる。

```shell {8}
$ k describe po liveness | grep -A10 Events
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  75s                default-scheduler  Successfully assigned default/liveness to docker-desktop
  Normal   Pulled     72s                kubelet            Successfully pulled image "nginx" in 2.6530177s
  Normal   Pulled     43s                kubelet            Successfully pulled image "nginx" in 2.5414899s
  Normal   Killing    16s (x2 over 46s)  kubelet            Container liveness failed liveness probe, will be restarted
  Normal   Pulling    15s (x3 over 75s)  kubelet            Pulling image "nginx"
  Normal   Created    13s (x3 over 72s)  kubelet            Created container liveness
  Normal   Started    13s (x3 over 72s)  kubelet            Started container liveness
  Normal   Pulled     13s                kubelet            Successfully pulled image "nginx" in 2.6919547s
```

## ReadinessProbe

`ReadinessProbe` は、Pod がリクエストに応答できるか状態かを確認する役割。

ユースケースとしては、この Probe が成功している Pod にのみトラフィックを送信したい場合などに適している。Service のバックエンドとして待ち構える Pod がリクエストに応答しない場合は、Service のロードバランシングからは切り離される挙動になる。

ここでは、HTTPGetAction で検証していく。

```yaml showLineNumbers
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: readiness
  name: readiness
spec:
  containers:
    - image: nginx
      name: readiness
      readinessProbe:
        httpGet:
          port: 80
          path: /
        failureThreshold: 3
        periodSeconds: 10
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

`kubectl describe` コマンドで設定できているか確認してみる。

```shell
$ k describe pod readiness | grep  Readiness
    Readiness:      http-get http://:80/ delay=0s timeout=1s period=10s #success=1 #failure=3
```

ReadinessProbe も設定できているのが分かる。
ここで確認用の Pod を作成して、Service に接続できるか確認してみる。

```shell
# 確認用の Pod を作成
$ k run test --image busybox --command sleep "3000"

# 確認用の Pod から Service に疎通
$ k exec -it test -- wget -O- readiness-svc
Connecting to readiness-svc (10.109.255.33:80)
writing to stdout
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
-                    100% |********************************|   615  0:00:00 ETA
written to stdout
```

Service 経由で readiness Pod で配信している HTML ファイルをダウンロードできているのが分かる。

Nginx のデフォルトのエントリーポイントは `/usr/share/nginx/html/index.html` 。なのでこれを削除すれば ReadinessProbe が失敗するか試してみる（後で戻したいのでファイル名を書き換えるに留めた）。

```shell
$ k exec -it readiness -- mv /usr/share/nginx/html/index.html /usr/share/nginx/html/tmp.html
```

```shell
# Pod のイベントに ReadinessProbe 失敗のイベントログが表示されている
$ k describe po readiness | grep -A5 Events
Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Warning  Unhealthy  10s (x6 over 60s)  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 403

# Service 経由でアクセスしても失敗する
$ k exec -it test -- wget -O- readiness-svc
Connecting to readiness-svc (10.109.255.33:80)
wget: can't connect to remote host (10.109.255.33): Connection refused
command terminated with exit code 1

# Pod の一覧を表示しても READY が 0 となっている
$ k get po
NAME        READY   STATUS    RESTARTS   AGE
readiness   0/1     Running   0          5m1s
test        1/1     Running   11         5m37s
```

ReadinessProbe が上手く動作しているのが確認できた。

この場合の挙動としては、LivenessProbe とは違って、**コンテナの再起動はされない**が、Service からのロードバランシングは停止される。

変更したファイル名をもとに戻してあげればトラフィックが再開するはずだ。

## StartupProbe

`StartupProbe` は、Pod の初回起動が完了したかを確認する役割。

名前からもだいたい予想はつくかもしれないが、起動の遅いコンテナに対して設定してあげると良い。

ExecAction で（例として適しているかは微妙だが）検証していく。

Pod は、下記のような YAML を適用して作成する。

```yaml showLineNumbers
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: startup
  name: startup
spec:
  containers:
    - image: nginx
      name: startup
      startupProbe:
        exec:
          command:
            - cat
            - /etc/nginx/nginx.conf
        initialDelaySeconds: 1
        periodSeconds: 2
        timeoutSeconds: 1
        successThreshold: 1
        failureThreshold: 1
      resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

確認すると、StartupProbe が成功して、Pod の起動ができていることが分かる。

```shell
$ k describe po startup | grep Startup
    Startup:        exec [cat /etc/nginx/nginx.conf] delay=1s timeout=1s period=2s #success=1 #failure=1

$ k get po
NAME      READY   STATUS    RESTARTS   AGE
startup   1/1     Running   0          65s
```

続いて下記のように YAML を修正して、StartupProbe が失敗するか見ていく。

```yaml {15} showLineNumbers
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: startup
  name: startup
spec:
  containers:
    - image: nginx
      name: startup
      startupProbe:
        exec:
          command:
            - cat
            - /etc/nginx/nginx.conf-do-not-exist
        initialDelaySeconds: 1
        periodSeconds: 2
        timeoutSeconds: 1
        successThreshold: 1
        failureThreshold: 1
      resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

```shell {15}
$ k replace --force -f <FILE_PATH>

$ k get po
NAME      READY   STATUS    RESTARTS   AGE
startup   0/1     Running   0          7s

$ k describe po startup | grep -A15 Events
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  68s                default-scheduler  Successfully assigned default/startup to docker-desktop
  Normal   Pulled     64s                kubelet            Successfully pulled image "nginx" in 3.0760395s
  Normal   Pulled     58s                kubelet            Successfully pulled image "nginx" in 3.1046343s
  Normal   Pulled     52s                kubelet            Successfully pulled image "nginx" in 2.8248999s
  Warning  Unhealthy  50s (x3 over 62s)  kubelet            Startup probe failed: cat: /etc/nginx/nginx.conf-do-not-exist: No such file or directory
  Normal   Killing    49s (x3 over 61s)  kubelet            Container startup failed startup probe, will be restarted
  Warning  BackOff    47s (x3 over 49s)  kubelet            Back-off restarting failed container
  Normal   Pulling    36s (x4 over 67s)  kubelet            Pulling image "nginx"
  Normal   Pulled     29s                kubelet            Successfully pulled image "nginx" in 7.3990341s
  Normal   Created    29s (x4 over 64s)  kubelet            Created container startup
  Normal   Started    28s (x4 over 64s)  kubelet            Started container startup

$ k get po -w
NAME      READY   STATUS             RESTARTS   AGE
startup   0/1     CrashLoopBackOff   4          90
```

イベントログを見ると `/etc/nginx/nginx.conf-do-not-exist` に対して「そんなファイルはないよ」というエラーとなり、コンテナの起動に失敗しているのが分かる。

この時 `failureThreshold` \* `periodSeconds` で計算される時間は起動を待ち続け、失敗すると `spec.restartPolicy` に従ってアクションする。（今回はファイルの確認のみなので 2 秒とした）

## まとめ

今回は k8s のヘルスチェックについてまとめてみた。

それぞれの特性を活かして、上手く活用できるようにしたい。

また `initialDelaySeconds` や `periodSeconds` などのヘルスチェック時の細かい設定値については割愛したが、運用時には考慮が必要なので引き続き深ぼっていきたい。

## 参考

https://kubernetes.io/ja/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

https://kubernetes.io/ja/docs/concepts/workloads/pods/pod-lifecycle/#when-should-you-use-a-startup-probe

https://cstoku.dev/posts/2018/k8sdojo-10/

https://amateur-engineer-blog.com/livenessprobe-readinessprobe/#toc7

https://zenn.dev/nekoshita/articles/4e838ae224ed56

[^1]: kubelet が自動で `spec.restartPolicy` に基づいたアクションを実行する。ref. [kubelet \| Kubernetes](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)

[^2]: `spec.containers.livenessProbe.periodSeconds` に特に設定していなければデフォルトは 30 秒。
