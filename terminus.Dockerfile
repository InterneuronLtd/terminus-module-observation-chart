# Use the official NGINX image as base
FROM nginx:latest
RUN apt-get update && \
    apt-get install -y tzdata && \
    echo "Europe/London" > /etc/timezone && \
    ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# Copy the static content of your website into the NGINX default public directory
COPY ./buildfolder /usr/share/nginx/html
COPY ./terminus.default.conf /etc/nginx/conf.d/default.conf
# Expose port 80 to allow external access
EXPOSE 80

# Start NGINX when the container starts
CMD ["nginx", "-g", "daemon off;"]