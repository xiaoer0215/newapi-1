package router

import (
	"bytes"
	"embed"
	"html"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
	ClassicBuildFS   embed.FS
	ClassicIndexPage []byte
}

func currentSEOIndexPage(indexPage []byte) []byte {
	page := indexPage
	if title := strings.TrimSpace(common.GetSystemTitle()); title != "" {
		page = replaceHTMLTagContent(page, "title", title)
		page = upsertMetaContent(page, "title", title)
	}
	if description := strings.TrimSpace(common.SEODescription); description != "" {
		page = upsertMetaContent(page, "description", description)
	}
	if keywords := strings.TrimSpace(common.SEOKeywords); keywords != "" {
		page = upsertMetaContent(page, "keywords", keywords)
	}
	if logo := strings.TrimSpace(common.Logo); logo != "" {
		page = replaceLinkHref(page, "icon", logo)
	}
	return page
}

func replaceHTMLTagContent(page []byte, tag string, value string) []byte {
	lower := bytes.ToLower(page)
	openTag := []byte("<" + tag + ">")
	closeTag := []byte("</" + tag + ">")
	start := bytes.Index(lower, openTag)
	if start < 0 {
		return page
	}
	contentStart := start + len(openTag)
	end := bytes.Index(lower[contentStart:], closeTag)
	if end < 0 {
		return page
	}
	contentEnd := contentStart + end
	escaped := []byte(html.EscapeString(value))
	out := make([]byte, 0, len(page)-contentEnd+contentStart+len(escaped))
	out = append(out, page[:contentStart]...)
	out = append(out, escaped...)
	out = append(out, page[contentEnd:]...)
	return out
}

func upsertMetaContent(page []byte, name string, value string) []byte {
	searchFrom := 0
	escaped := []byte(html.EscapeString(value))
	matchedDoubleQuoteName := []byte(`name="` + strings.ToLower(name) + `"`)
	matchedSingleQuoteName := []byte(`name='` + strings.ToLower(name) + `'`)
	for {
		lower := bytes.ToLower(page)
		idx := bytes.Index(lower[searchFrom:], []byte("<meta"))
		if idx < 0 {
			return insertMetaTag(page, name, value)
		}
		start := searchFrom + idx
		endRel := bytes.Index(lower[start:], []byte(">"))
		if endRel < 0 {
			return page
		}
		end := start + endRel + 1
		tagLower := lower[start:end]
		if bytes.Contains(tagLower, matchedDoubleQuoteName) || bytes.Contains(tagLower, matchedSingleQuoteName) {
			contentIdx := bytes.Index(tagLower, []byte("content="))
			if contentIdx < 0 {
				return page
			}
			attrStart := start + contentIdx + len("content=")
			if attrStart >= len(page) {
				return page
			}
			quote := page[attrStart]
			if quote != '\'' && quote != '"' {
				return page
			}
			valueStart := attrStart + 1
			valueEndRel := bytes.IndexByte(page[valueStart:end], quote)
			if valueEndRel < 0 {
				return page
			}
			valueEnd := valueStart + valueEndRel
			out := make([]byte, 0, len(page)-valueEnd+valueStart+len(escaped))
			out = append(out, page[:valueStart]...)
			out = append(out, escaped...)
			out = append(out, page[valueEnd:]...)
			return out
		}
		searchFrom = end
	}
}

func insertMetaTag(page []byte, name string, value string) []byte {
	lower := bytes.ToLower(page)
	headEnd := bytes.Index(lower, []byte("</head>"))
	if headEnd < 0 {
		return page
	}
	tag := []byte("\n    <meta name=\"" + name + "\" content=\"" + html.EscapeString(value) + "\" />")
	out := make([]byte, 0, len(page)+len(tag))
	out = append(out, page[:headEnd]...)
	out = append(out, tag...)
	out = append(out, page[headEnd:]...)
	return out
}

func replaceLinkHref(page []byte, rel string, value string) []byte {
	lower := bytes.ToLower(page)
	searchFrom := 0
	escaped := []byte(html.EscapeString(value))
	for {
		idx := bytes.Index(lower[searchFrom:], []byte("<link"))
		if idx < 0 {
			return page
		}
		start := searchFrom + idx
		endRel := bytes.Index(lower[start:], []byte(">"))
		if endRel < 0 {
			return page
		}
		end := start + endRel + 1
		tagLower := lower[start:end]
		if bytes.Contains(tagLower, []byte(`rel="`+strings.ToLower(rel)+`"`)) || bytes.Contains(tagLower, []byte(`rel='`+strings.ToLower(rel)+`'`)) {
			hrefIdx := bytes.Index(tagLower, []byte("href="))
			if hrefIdx < 0 {
				return page
			}
			attrStart := start + hrefIdx + len("href=")
			if attrStart >= len(page) {
				return page
			}
			quote := page[attrStart]
			if quote != '\'' && quote != '"' {
				return page
			}
			valueStart := attrStart + 1
			valueEndRel := bytes.IndexByte(page[valueStart:end], quote)
			if valueEndRel < 0 {
				return page
			}
			valueEnd := valueStart + valueEndRel
			out := make([]byte, 0, len(page)-valueEnd+valueStart+len(escaped))
			out = append(out, page[:valueStart]...)
			out = append(out, escaped...)
			out = append(out, page[valueEnd:]...)
			return out
		}
		searchFrom = end
	}
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")
	themeFS := common.NewThemeAwareFS(defaultFS, classicFS)

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", themeFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		if common.GetTheme() == "classic" {
			c.Data(http.StatusOK, "text/html; charset=utf-8", currentSEOIndexPage(assets.ClassicIndexPage))
		} else {
			c.Data(http.StatusOK, "text/html; charset=utf-8", currentSEOIndexPage(assets.DefaultIndexPage))
		}
	})
}
