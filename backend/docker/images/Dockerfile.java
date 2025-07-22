FROM openjdk:11

# Create non-root user
RUN useradd -m -s /bin/sh judgeuser

# Create working directory and set permissions
RUN mkdir -p /app && \
    chown -R judgeuser:judgeuser /app && \
    chmod 755 /app

# Set working directory
WORKDIR /app

# Switch to non-root user
USER judgeuser

# Default command (will be overridden)
CMD ["/bin/sh"]