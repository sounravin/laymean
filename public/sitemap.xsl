<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:template match="/">
    <html lang="km">
      <head>
        <title>Sitemap - Luypay Ledger</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b1329;
            color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .container {
            max-width: 800px;
            width: 100%;
            background: #1e293b;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
            border: 1px border #334155;
            padding: 30px;
          }
          h1 {
            font-size: 24px;
            margin-top: 0;
            color: #38bdf8;
            font-weight: 800;
            border-bottom: 2px solid #334155;
            padding-bottom: 12px;
          }
          p {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.6;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #0f172a;
            color: #94a3b8;
            text-align: left;
            padding: 12px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 700;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #334155;
            font-size: 13px;
          }
          tr:hover td {
            background-color: #1e293b;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 6px;
            background-color: #0369a1;
            color: #e0f2fe;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗺️ XML Sitemap (ផែនទីគេហទំព័រ)</h1>
          <p>
            This is an XML Sitemap, meant for search engine indexers like Google or Bing to discover and catalog the pages of <strong>Luypay Ledger</strong>.
            This stylesheet makes it readable for humans.
          </p>
          <table>
            <thead>
              <tr>
                <th>Location / URL</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td>
                    <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="s:priority"/></span>
                  </td>
                  <td>
                    <xsl:value-of select="s:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="s:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
