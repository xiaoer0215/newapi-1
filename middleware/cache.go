package middleware

import (
	"path"

	"github.com/gin-gonic/gin"
)

func Cache() func(c *gin.Context) {
	return func(c *gin.Context) {
		requestPath := c.Request.URL.Path
		if path.Ext(requestPath) == "" {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		} else {
			c.Header("Cache-Control", "public, max-age=604800, immutable") // one week
		}
		c.Header("Cache-Version", "b688f2fb5be447c25e5aa3bd063087a83db32a288bf6a4f35f2d8db310e40b14")
		c.Next()
	}
}
