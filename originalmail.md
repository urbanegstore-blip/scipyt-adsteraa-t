Delivered-To: anzar005k@gmail.com
Received: by 2002:ab3:9704:0:b0:644:c2b:bfc2 with SMTP id i4csp164410qna; Fri, 8 May 2026 07:58:02 -0700 (PDT)
X-Forwarded-Encrypted: i=3; AFNElJ8hmItFV86y1dnQOGEUZ3lOfF8rcskMFZTjGliTwgmfh9MRev+bmVtzVeE8sXWgvqve5vmgIsCu7hM=@gmail.com
X-Received: by 2002:ac8:590e:0:b0:50f:b61c:ec4c with SMTP id d75a77b69052e-51475b5a04emr92375181cf.7.1778252282791; Fri, 08 May 2026 07:58:02 -0700 (PDT)
ARC-Seal: i=2; a=rsa-sha256; t=1778252282; cv=pass; d=google.com; s=arc-20240605; b=V0zYD8aiqR3ucusjwsVzzoX4NpTQWkaCh9NGAa5qKSDvHsG+6eKTwTF871+kjmmDyn rpYQabM1UfKt8gfkHIHX1VEfCIffLZyLpvto9wHVbq6ASngMshMaLAHOfH37XkGfsr0F xDCmIGRC1fYs/PsQnc0lbvaMdD+PUClJat/a/HvyQ1XY72afozEim4/lgOVff1i5LrfX 5wPNfzTwKZqBZI+4NmxC6qROGA3YWMsE6lYRFrU8UHFgy47mYinDiv0oUNf89TRS0GT3 rVziKLSUS3RI5VJUEKWrWTS+aFtD0+MNA3Nv5pQRDaTM5hCjwz9ydr0coYrh8pxZftyJ AyJw==
ARC-Message-Signature: i=2; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605; h=to:message-id:content-transfer-encoding:subject:from:date :mime-version:dkim-signature:feedback-id:dkim-signature :dkim-signature; bh=rniDq4P0uwW2FvDp9NDxzeQo3+gVw6KxUa3hj/ANOMg=; fh=loXHwVVVfXVodcAXarlolqX0gBfRLo8050mgp4bskXo=; b=dIlWFt0TMR2iUZ9wkmSKR1kbV79XYN99EmRykqZvDgpjXMZU596F+7ZFdMbBWIflMV LamcxPCsHvQJPMG/w5hbBsqGeVDDJdHEJOp0fGWEtJYbjyd4+vv6oq/HP7Z8zvcvyAjm bME8fAI3XVACrzUXO03PL9907ZMItSHGcpIjN4dCUS8rA1uATWx/LY3Iwhb+fYiIu7PW IGFtbSkldS+81o1ureIyjD2sxO6naF/vKnuNmb2ALRoyeEPcbE3IngpkTb+xv7x+pPxf nNy2norLr6bCTrE5YwSV5B/eNl+K7GLQpYk/OmXDUqrG5GGkyhpS4TjV4MFkKXQtptc8 sZ/Q==; dara=google.com
ARC-Authentication-Results: i=2; mx.google.com; dkim=pass header.i=@cloudflare-email.net header.s=cf2024-1 header.b=fAGOm+0k; dkim=pass header.i=@urbansedge.shop header.s=cf2024-1 header.b=Nf1DJDzC; dkim=pass header.i=@browserless.io header.s=s1 header.b="CiN9J/AU"; arc=pass (i=1 spf=pass spfdomain=email.browserless.io dkim=pass dkdomain=browserless.io dmarc=pass fromdomain=browserless.io); spf=pass (google.com: domain of cfbounces+ndrdrop@urbansedge.shop designates 104.30.10.202 as permitted sender) smtp.mailfrom=cfbounces+ndrdrop@urbansedge.shop; dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=browserless.io
Return-Path: <cfbounces+ndrdrop@urbansedge.shop>
Received: from ba-cac.cloudflare-email.net (ba-cac.cloudflare-email.net. [104.30.10.202]) by mx.google.com with ESMTPS id d75a77b69052e-5148e82c617si22837011cf.136.2026.05.08.07.58.02 for <anzar005k@gmail.com> (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256 bits=128/128); Fri, 08 May 2026 07:58:02 -0700 (PDT)
Received-SPF: pass (google.com: domain of cfbounces+ndrdrop@urbansedge.shop designates 104.30.10.202 as permitted sender) client-ip=104.30.10.202;
Authentication-Results: mx.google.com; dkim=pass header.i=@cloudflare-email.net header.s=cf2024-1 header.b=fAGOm+0k; dkim=pass header.i=@urbansedge.shop header.s=cf2024-1 header.b=Nf1DJDzC; dkim=pass header.i=@browserless.io header.s=s1 header.b="CiN9J/AU"; arc=pass (i=1 spf=pass spfdomain=email.browserless.io dkim=pass dkdomain=browserless.io dmarc=pass fromdomain=browserless.io); spf=pass (google.com: domain of cfbounces+ndrdrop@urbansedge.shop designates 104.30.10.202 as permitted sender) smtp.mailfrom=cfbounces+ndrdrop@urbansedge.shop; dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=browserless.io
DKIM-Signature: v=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; c=relaxed/relaxed; h=To:Subject:From:Date:Feedback-ID:reply-to:cc:resent-date:resent-from :resent-to:resent-cc:in-reply-to:references:list-id:list-help :list-unsubscribe:list-unsubscribe-post:list-subscribe:list-post :list-owner:list-archive; t=1778252282; x=1778857082; bh=rniDq4P0uwW2FvDp9N DxzeQo3+gVw6KxUa3hj/ANOMg=; b=fAGOm+0kzvFyGQ8N+QH2xUvZntr6PugYBaNHZL0wcN3tL C5p1hHegdURDvtJwMTlFEcsPCk/QdkU/Gr4uRv9KLPqkYdD9oWJ9n0aVBocCf1OQbBsxa4uwBX5 vKaEyyUFZ/GCjBYhneCfw+SjEnBp54fpGKPlSfuP4vmstInEx2+DTKSNDytkxMVaixDKskMw9lW JqpLUbQQ3yNhUYRLPfUpLaftGU1DBEZQYR4Z98Q/0//hqSirg7XU3WUEqnvZMdhkniTFfyFnjye qrr9jmKX+kXI5Hx1J02zpBa6+uexo6S+g/+M72Gq6DwvcfQabv7rP58c7b8/NZ9rz1wnO60A==;
DKIM-Signature: v=1; a=rsa-sha256; s=cf2024-1; d=urbansedge.shop; c=relaxed/relaxed; h=To:Subject:From:Date:Feedback-ID:reply-to:cc:resent-date:resent-from :resent-to:resent-cc:in-reply-to:references:list-id:list-help :list-unsubscribe:list-unsubscribe-post:list-subscribe:list-post :list-owner:list-archive; t=1778252282; x=1778857082; bh=rniDq4P0uwW2FvDp9N DxzeQo3+gVw6KxUa3hj/ANOMg=; b=Nf1DJDzC2pCzjj8cWVagsifertJSDPU4p5d00fcaqkPGQ dofvks+AvVBl9n3MhIu8Z5a5qbod3DWeHAf5CgXWGj5HFtz+VC32/7AYsd2/2rR/8Arypo5rzWs 1+IqnUUrmLEJj8VjDsMjQeZoSpuGVD11RIXuwDDYtOtcRuhq+PqmTSnk5jVw2KYACOIut1OcoBK NiLOB2aNbePWjzJ5cizGh5d96IE6EBmm+/IiPIPj+zdC5mVwtTc5o0AkL0+c3oCs0xqIMiMhEzV Fx5P6MFWQqwwAY/WAC7YaYuVrUJMCIn2GDfV9+1ZnHC5IxMXM6OBfZj6dfhhguqjpKBxygAw==;
X-Forwarded-To: anzar005k@gmail.com
X-Forwarded-For: creepy@urbansedge.shop anzar005k@gmail.com
Feedback-ID: urbansedge.shop:1:1:Cloudflare
Received: from s.pnkfpknx.outbound-mail.sendgrid.net (50.31.49.42) by cloudflare-email.net (cloudflare) id ZJv12T7FzJBE for <creepy@urbansedge.shop>; Fri, 08 May 2026 14:58:00 +0000
ARC-Seal: i=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; cv=none; b=DBP4G2Qk20TdhqtNk/UX7ByAmgshbPzep29DOahaAp9djdTwgSYVpCCXG2wAw/RwtZf9spal6 rUr+W5Oq+h6mWkhxRlftxTt2zaot5zJUTAcTOURMyMovQcAxLB+aMtqUuGiLoSCEAfs0s1EEpCU AV3gvC8+V3C5t1qf/NY9/nCx+jxgUjIoPQR2aERBiIsUc6mmr+7uK43SH13fQNPN7CJRrzVT0rD jlyhAbSC/LG8XeED6HA5xHQzFIAFtAhA/2j+8atv9C31omqNTELvnRYba8oJRnqBKoDefOO44ci EY/FcdZiLLJEv8Xotk/x+d+WEVaEewVmS2yGhMyVXQ9g==;
ARC-Message-Signature: i=1; a=rsa-sha256; s=cf2024-1; d=cloudflare-email.net; c=relaxed/relaxed; h=To:Subject:From:Date:reply-to:cc:resent-date:resent-from:resent-to :resent-cc:in-reply-to:references:list-id:list-help:list-subscribe :list-post:list-owner:list-archive; t=1778252281; x=1778857081; bh=rniDq4P0 uwW2FvDp9NDxzeQo3+gVw6KxUa3hj/ANOMg=; b=ft3pk1a8YyXangGWmzjomTdqtNBhL+i9Cdn 0LUSK3bYwEJsWxWnIzwOR0gz3Q1s9HvPi8rOSL9vpECR6ANUsZ64cPbwE8M8MS+80Mq+3y93bEs gGAGUKkmjDE86G2SNl3e0o4jmS+Bib+rn/qtBSkFghPxR9eWdn2C08V+gW8VU1GG+nqOCrC2gRu u9IehW6lGe8K90JM6RgZ4/JgonPd+YYfV0YZ2Qq+aWt8GoWgGs/HAQHc+lPbYfHhKKu4sYvuNlC XqLz1A6XlMHuxY78XW0aYU/mCj6nLQKbyV1bLYNoFH4tF1YPB1vZ001PXRKzfWe2rozu88FgRzx B8waBPQ==;
ARC-Authentication-Results: i=1; mx.cloudflare.net; dkim=pass header.d=browserless.io header.s=s1 header.b=CiN9J/AU; dmarc=pass header.from=browserless.io policy.dmarc=none; spf=none (mx.cloudflare.net: no SPF records found for postmaster@s.pnkfpknx.outbound-mail.sendgrid.net) smtp.helo=s.pnkfpknx.outbound-mail.sendgrid.net; spf=pass (mx.cloudflare.net: domain of bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io designates 50.31.49.42 as permitted sender) smtp.mailfrom=bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io; arc=none smtp.remote-ip=50.31.49.42
Received-SPF: pass (mx.cloudflare.net: domain of bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io designates 50.31.49.42 as permitted sender) receiver=mx.cloudflare.net; client-ip=50.31.49.42; envelope-from="bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io"; helo=s.pnkfpknx.outbound-mail.sendgrid.net;
Authentication-Results: mx.cloudflare.net; dkim=pass header.d=browserless.io header.s=s1 header.b=CiN9J/AU; dmarc=pass header.from=browserless.io policy.dmarc=none; spf=none (mx.cloudflare.net: no SPF records found for postmaster@s.pnkfpknx.outbound-mail.sendgrid.net) smtp.helo=s.pnkfpknx.outbound-mail.sendgrid.net; spf=pass (mx.cloudflare.net: domain of bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io designates 50.31.49.42 as permitted sender) smtp.mailfrom=bounces+6076035-b403-creepy=urbansedge.shop@email.browserless.io; arc=none smtp.remote-ip=50.31.49.42
X-CF-SpamH-Score: 0
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=browserless.io; h=mime-version:date:from:subject:content-type:content-transfer-encoding: to:cc:content-type:date:from:subject:to; s=s1; t=1778252280; bh=rniDq4P0uwW2FvDp9NDxzeQo3+gVw6KxUa3hj/ANOMg=; b=CiN9J/AU9nJKd38oAR/n1EWo+JDHPlmkFxHFDSdQs8FCOmosRjKz4XUQhzXiPeQ+HfIK Ve/WbGFpJ4T23pqm1QP8iDP/OlC2u/HtRIbO6XgdalJu5rBnshAJHNKw90ATsgGOGDN+1h Xao4l2A447koZbqrxlt1PoRKCR0KzIITA7iqIWtAzROamF51/Zk6cG78Next1pJQAKpwK2 oA+uX3TuIa5x9Kv1+393GQ1oCi7jQsVkquw9mHXuNzNCLxECtC8dHgDFgRRKSCpiNfZPyG ZflnymNZ1Qe5cOJevs2tBN8Kh77+pBsdyTzl6FTpojzVnc167gxdsjqET9aYr/yA==
Received: by recvd-6575d5864f-k69dv with SMTP id recvd-6575d5864f-k69dv-1-69FDF9F7-3B 2026-05-08 14:57:59.96065584 +0000 UTC m=+840029.350394262
Received: from data.browserless.io (unknown) by geopod-ismtpd-17 (SG) with ESMTP id 2UoUgcirThWpk-6Lx-697g for <creepy@urbansedge.shop>; Fri, 08 May 2026 14:57:59.920 +0000 (UTC)
Mime-Version: 1.0
Date: Fri, 08 May 2026 14:58:00 +0000 (UTC)
From: Browserless <no-reply@browserless.io>
Subject: [Action required] Verify your email address
Content-Type: text/html; charset=us-ascii
Content-Transfer-Encoding: quoted-printable
Message-ID: <2UoUgcirThWpk-6Lx-697g@geopod-ismtpd-17>
X-SG-EID: =?us-ascii?Q?u001=2EvAXX+01DIkWYP9so4zGZOYiQt+EP1UNqUEgEQYUIKRXR485mUdsEDjOiL?= =?us-ascii?Q?5b4PQIG4EPLGyCBnBDeTqcVonCeIy0SLmA54KMB?= =?us-ascii?Q?KOf3OPgnmXZij06lsblYpJdC=2F=2FO+ydJIO1UfE3U?= =?us-ascii?Q?xfA3ludkqfWBtYVN6Uu2jiBt1car4r5q=2FZ3z8AF?= =?us-ascii?Q?qZ=2F9H2w+oHdR2uMbuiQPRWROqybWUAWy8jMtC2C?= =?us-ascii?Q?c4vRciwdrs8rk92i7vHGQcD+BLeNSlxvewXhe8m?= =?us-ascii?Q?Ax0V?=
To: creepy@urbansedge.shop
X-Entity-ID: u001.EGGYkAPaW+XnoAaE+Pdugw==

<!DOCTYPE html>
<html
  lang=3D"und"
  dir=3D"auto"
  xmlns=3D"http://www.w3.org/1999/xhtml"
  xmlns:v=3D"urn:schemas-microsoft-com:vml"
  xmlns:o=3D"urn:schemas-microsoft-com:office:office"
>
  <head>
    <title></title>
   =20
    <meta http-equiv=3D"X-UA-Compatible" content=3D"IE=3Dedge" />
   =20
    <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8=
" />
    <meta name=3D"viewport" content=3D"width=3Ddevice-width, initial-scale=
=3D1" />
    <style type=3D"text/css">
      #outlook a {
        padding: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
   =20
   =20

    <style type=3D"text/css">
      @media only screen and (min-width: 480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style media=3D"screen and (min-width:480px)">
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>

    <style type=3D"text/css">
      @media only screen and (max-width: 479px) {
        table.mj-full-width-mobile {
          width: 100% !important;
        }
        td.mj-full-width-mobile {
          width: auto !important;
        }
      }
    </style>
  </head>
  <body style=3D"word-spacing: normal">
    <div style=3D"" lang=3D"und" dir=3D"auto">
     =20

      <div style=3D"margin: 0px auto; max-width: 600px">
        <table
          align=3D"center"
          border=3D"0"
          cellpadding=3D"0"
          cellspacing=3D"0"
          role=3D"presentation"
          style=3D"width: 100%"
        >
          <tbody>
            <tr>
              <td
                style=3D"
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                "
              >
               =20

                <div
                  class=3D"mj-column-per-100 mj-outlook-group-fix"
                  style=3D"
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border=3D"0"
                    cellpadding=3D"0"
                    cellspacing=3D"0"
                    role=3D"presentation"
                    style=3D"vertical-align: top"
                    width=3D"100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align=3D"center"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <table
                            border=3D"0"
                            cellpadding=3D"0"
                            cellspacing=3D"0"
                            role=3D"presentation"
                            style=3D"
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                          >
                            <tbody>
                              <tr>
                                <td style=3D"width: 75px">
                                  <img
                                    alt=3D""
                                    src=3D"https://public-assets-browserles=
s.s3.amazonaws.com/browserlesss-240-240.png"
                                    style=3D"
                                      border: 0;
                                      display: block;
                                      outline: none;
                                      text-decoration: none;
                                      height: auto;
                                      width: 100%;
                                      font-size: 13px;
                                    "
                                    width=3D"75"
                                    height=3D"auto"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align=3D"left"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style=3D"
                              font-family: helvetica;
                              font-size: 28px;
                              line-height: 1;
                              text-align: left;
                              color: #333333;
                            "
                          >
                            Verify your email
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align=3D"left"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style=3D"
                              font-family: helvetica;
                              font-size: 20px;
                              line-height: 1.4;
                              text-align: left;
                              color: #333333;
                            "
                          >
                            Please copy or use the code below in order to v=
erify
                            this email address. This code will automaticall=
y
                            expire in 15 minutes.
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align=3D"left"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-bottom: 40px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style=3D"
                              font-family: monospace;
                              font-size: 30px;
                              line-height: 1.4;
                              text-align: left;
                              color: #333333;
                            "
                          >
                          252601
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align=3D"left"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style=3D"
                              font-family: helvetica;
                              font-size: 20px;
                              line-height: 0;
                              text-align: left;
                              color: #333333;
                            "
                          >
                            Thanks,
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align=3D"left"
                          style=3D"
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style=3D"
                              font-family: helvetica;
                              font-size: 20px;
                              line-height: 18px;
                              text-align: left;
                              color: #333333;
                            "
                          >
                            The browserless.io team
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

               =20
              </td>
            </tr>
          </tbody>
        </table>
      </div>

     =20
    </div>
  <img src=3D"http://url7935.browserless.io/wf/open?upn=3Du001.KO34pONt3qPa=
To9vn07VTXGCXpMyy8kMxydsFRB0CMeUjwms-2FoBTlWFA9eHtdJxbHHQtqiYhkhZWtjSOrOjxY=
54DlUaGaMUmI0cTtoPHDIdR4J6fd-2BwpnW-2FVyBwgItBN687UI7h37ZbiJyXxteYj1p3BE3EX=
Er3qONOzgNRayEMOm-2B-2FA83-2B4l6h-2FCdku-2BkeiuV2ImvGF3CIP99HNDRTR3g-3D-3D"=
 alt=3D"" width=3D"1" height=3D"1" border=3D"0" style=3D"height:1px !import=
ant;width:1px !important;border-width:0 !important;margin-top:0 !important;=
margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !importa=
nt;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !im=
portant;padding-left:0 !important;"/></body>
</html>
2UTpkBJ5LqSS7uDbc1063a598596d69b60bc9c59138b40f16