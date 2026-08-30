const fetch = require('node-fetch');
const ebayAuth = require('./ebayAuth');

const EBAY_API_BASE = 'https://api.sandbox.ebay.com';

class EbayApiClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async request(endpoint, options = {}) {
    const url = `${EBAY_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Language': 'en-US',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(`eBay API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async requestMultipart(endpoint, formData) {
    const url = `${EBAY_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      ...formData.getHeaders()
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(`eBay API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async createInventoryItem(sku, itemData) {
    return this.request(`/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async getInventoryItem(sku) {
    return this.request(`/sell/inventory/v1/inventory_item/${sku}`);
  }

  async updateInventoryItem(sku, itemData) {
    return this.request(`/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteInventoryItem(sku) {
    return this.request(`/sell/inventory/v1/inventory_item/${sku}`, {
      method: 'DELETE'
    });
  }

  async createOffer(sku, offerData) {
    return this.request('/sell/inventory/v1/offer', {
      method: 'POST',
      body: JSON.stringify({ sku, ...offerData })
    });
  }

  async getOffer(offerId) {
    return this.request(`/sell/inventory/v1/offer/${offerId}`);
  }

  async updateOffer(offerId, offerData) {
    return this.request(`/sell/inventory/v1/offer/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData)
    });
  }

  async publishOffer(offerId) {
    return this.request(`/sell/inventory/v1/offer/${offerId}/publish`, {
      method: 'POST'
    });
  }

  async endOffer(offerId) {
    return this.request(`/sell/inventory/v1/offer/${offerId}/end`, {
      method: 'POST'
    });
  }

  async getOffers(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return this.request(`/sell/inventory/v1/offer?${params.toString()}`);
  }

  async uploadImages(imageUrls) {
    const FormData = require('form-data');
    const uploadedUrls = [];

    for (const imageUrl of imageUrls) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) continue;

        const buffer = await imageResponse.buffer();
        const formData = new FormData();
        formData.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

        const result = await this.requestMultipart('/sell/inventory/v1/picture', formData);
        if (result.imageUrl) {
          uploadedUrls.push(result.imageUrl);
        }
      } catch (err) {
        console.error('Failed to upload image:', imageUrl, err.message);
      }
    }

    return uploadedUrls;
  }

  async getShippingPolicies() {
    return this.request('/sell/account/v1/shipping_policy');
  }

  async createShippingPolicy(policyData) {
    return this.request('/sell/account/v1/shipping_policy', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async getReturnPolicies() {
    return this.request('/sell/account/v1/return_policy');
  }

  async createReturnPolicy(policyData) {
    return this.request('/sell/account/v1/return_policy', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async getPaymentPolicies() {
    return this.request('/sell/account/v1/payment_policy');
  }

  async createPaymentPolicy(policyData) {
    return this.request('/sell/account/v1/payment_policy', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async suggestCategories(query) {
    return this.request(`/commerce/taxonomy/v1/category_suggestions?q=${encodeURIComponent(query)}`);
  }

  async getCategoryTree(categoryId) {
    return this.request(`/commerce/taxonomy/v1/category_tree/${categoryId}`);
  }

  async getItemAspectsForCategory(categoryId) {
    return this.request(`/commerce/taxonomy/v1/category/${categoryId}/item_aspects`);
  }

  async getOrCreateDefaultShippingPolicy() {
    const policies = await this.getShippingPolicies();
    if (policies.shippingPolicies && policies.shippingPolicies.length > 0) {
      return policies.shippingPolicies[0].shippingPolicyId;
    }

    const defaultPolicy = {
      name: 'SellShot Default Shipping',
      description: 'Default shipping policy for SellShot listings',
      shippingPolicyType: 'DOMESTIC',
      domesticShippingPolicy: {
        shippingPolicyOptions: [
          {
            shippingCarrierCode: 'USPS',
            shippingServiceCode: 'USPSFirstClass',
            freeShipping: true,
            shippingCost: { value: '0.0', currency: 'USD' },
            shippingInsurance: { value: '0.0', currency: 'USD' },
            shippingPackageHandlingCost: { value: '0.0', currency: 'USD' }
          }
        ]
      }
    };

    const created = await this.createShippingPolicy(defaultPolicy);
    return created.shippingPolicyId;
  }

  async getOrCreateDefaultReturnPolicy() {
    const policies = await this.getReturnPolicies();
    if (policies.returnPolicies && policies.returnPolicies.length > 0) {
      return policies.returnPolicies[0].returnPolicyId;
    }

    const defaultPolicy = {
      name: 'SellShot Default Returns',
      description: 'Default return policy for SellShot listings',
      returnPolicyType: 'MONEY_BACK',
      returnPeriod: { unit: 'DAY', value: 30 },
      returnMethod: 'REPLACEMENT',
      returnShippingCostPayer: 'SELLER',
      restockingFee: { value: '0.0', currency: 'USD' }
    };

    const created = await this.createReturnPolicy(defaultPolicy);
    return created.returnPolicyId;
  }

  async getOrCreateDefaultPaymentPolicy() {
    const policies = await this.getPaymentPolicies();
    if (policies.paymentPolicies && policies.paymentPolicies.length > 0) {
      return policies.paymentPolicies[0].paymentPolicyId;
    }

    const defaultPolicy = {
      name: 'SellShot Default Payment',
      description: 'Default payment policy for SellShot listings',
      marketplaceId: 'EBAY_US',
      paymentMethodTypes: ['PAYPAL'],
      paypalEmailAddress: process.env.EBAY_PAYPAL_EMAIL || 'payments@sellshot.com'
    };

    const created = await this.createPaymentPolicy(defaultPolicy);
    return created.paymentPolicyId;
  }

  async createListingFromItem(item, marketplaceAuth, prisma) {
    const sku = `sellshot-${item.id}`;
    const accessToken = await ebayAuth.getValidAccessToken(marketplaceAuth.userId, prisma);
    const client = new EbayApiClient(accessToken);

    let imageUrls = item.images?.map(img => img.url) || [];
    if (imageUrls.length > 0) {
      const uploadedUrls = await client.uploadImages(imageUrls);
      if (uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
      }
    }

    const inventoryItem = {
      availability: {
        shipToLocationAvailability: {
          quantity: 1
        }
      },
      condition: this.mapCondition(item.condition),
      product: {
        title: item.title,
        description: item.description,
        aspects: this.buildAspects(item),
        brand: item.brand || 'Unbranded',
        imageUrls
      }
    };

    await client.createInventoryItem(sku, inventoryItem);

    const [shippingPolicyId, returnPolicyId, paymentPolicyId] = await Promise.all([
      client.getOrCreateDefaultShippingPolicy(),
      client.getOrCreateDefaultReturnPolicy(),
      client.getOrCreateDefaultPaymentPolicy()
    ]);

    const offer = {
      sku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      availableQuantity: 1,
      categoryId: this.getCategoryId(item.category),
      listingDescription: item.description,
      pricingSummary: {
        price: {
          value: String(item.estimatedPrice || item.listings?.[0]?.listingPrice || 0),
          currency: 'USD'
        }
      },
      merchantLocationKey: 'default',
      taxonId: this.getCategoryId(item.category),
      shippingPolicyId,
      returnPolicyId,
      paymentPolicyId
    };

    const createdOffer = await client.createOffer(sku, offer);
    const publishedOffer = await client.publishOffer(createdOffer.offerId);

    return {
      externalId: publishedOffer.listingId,
      externalUrl: `https://www.sandbox.ebay.com/itm/${publishedOffer.listingId}`,
      offerId: createdOffer.offerId,
      sku
    };
  }

  async updateListing(item, listing, marketplaceAuth, prisma) {
    const accessToken = await ebayAuth.getValidAccessToken(marketplaceAuth.userId, prisma);
    const client = new EbayApiClient(accessToken);

    if (listing.offerId) {
      const [shippingPolicyId, returnPolicyId, paymentPolicyId] = await Promise.all([
        client.getOrCreateDefaultShippingPolicy(),
        client.getOrCreateDefaultReturnPolicy(),
        client.getOrCreateDefaultPaymentPolicy()
      ]);

      const offerData = {
        sku: listing.sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        availableQuantity: 1,
        categoryId: this.getCategoryId(item.category),
        listingDescription: item.description,
        pricingSummary: {
          price: {
            value: String(listing.listingPrice || item.estimatedPrice || 0),
            currency: 'USD'
          }
        },
        shippingPolicyId,
        returnPolicyId,
        paymentPolicyId
      };

      await client.updateOffer(listing.offerId, offerData);
    }
  }

  async endListing(listing, marketplaceAuth, prisma) {
    const accessToken = await ebayAuth.getValidAccessToken(marketplaceAuth.userId, prisma);
    const client = new EbayApiClient(accessToken);

    if (listing.offerId) {
      await client.endOffer(listing.offerId);
    }
  }

  mapCondition(condition) {
    const map = {
      'new_with_tags': 'NEW',
      'like_new': 'LIKE_NEW',
      'good': 'USED_GOOD',
      'fair': 'USED_FAIR',
      'poor': 'USED_POOR'
    };
    return map[condition] || 'USED_GOOD';
  }

  buildAspects(item) {
    const aspects = [];
    if (item.size) aspects.push({ name: 'Size', values: [item.size] });
    if (item.color) aspects.push({ name: 'Color', values: [item.color] });
    if (item.material) aspects.push({ name: 'Material', values: [item.material] });
    if (item.brand) aspects.push({ name: 'Brand', values: [item.brand] });
    return aspects;
  }

  getCategoryId(category) {
    const categoryMap = {
      'tops': '155186',
      'bottoms': '155187',
      'dresses': '155188',
      'outerwear': '155189',
      'shoes': '155190',
      'accessories': '155191',
      'other': '155192'
    };
    return categoryMap[category] || '155192';
  }
}

module.exports = EbayApiClient;